import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import mongoose, { type ObjectId } from "mongoose";
import type { Logger } from "winston";
import { OrderModel } from "../order/order-model";
import { type Order, PaymentStatus } from "../order/order-type";
import type { MessageBroker } from "../types/broker";
import type { PaymentGW } from "./payment-type";

const MAX_RETRIES = 3;
const RETRY_DELAY = (attempt: number) => 2 ** attempt * 1000; // Exponential backoff

export class PaymentController {
	constructor(
		private paymentGw: PaymentGW,
		private logger: Logger,
		private broker: MessageBroker,
	) {}

	handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
		const webHookBody = req.body;

		// Validate event type
		if (webHookBody.type !== "checkout.session.completed") {
			this.logger.warn("Ignoring unsupported webhook type", {
				type: webHookBody.type,
			});
			res.status(400).json({
				success: false,
				message: "Unsupported webhook type",
			});
			return;
		}

		const sessionId = webHookBody.data.object.id;

		try {
			// Fetch payment session
			const verifiedSession = await this.paymentGw.getSession(sessionId);
			const orderId = verifiedSession.metadata.orderId;
			const isPaymentSuccessful = verifiedSession.paymentStatus === "paid";

			// Check for idempotency: Ensure order isn't already updated
			const existingOrder = await OrderModel.findById(orderId);

			if (!existingOrder) {
				this.logger.error("Order not found", { orderId });
				return next(createHttpError(404, "Order not found"));
			}

			if (existingOrder.paymentStatus === PaymentStatus.PAID) {
				this.logger.info("Ignoring duplicate webhook for already paid order", {
					orderId,
				});
				res.json({
					success: true,
					message: "Duplicate webhook ignored",
				});
				return;
			}
			// Use a transaction to update the order
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				const updatedOrder = await OrderModel.findByIdAndUpdate(
					orderId,
					{
						paymentStatus: isPaymentSuccessful
							? PaymentStatus.PAID
							: PaymentStatus.FAILED,
					},
					{ new: true, session },
				);
				if (!updatedOrder) {
					throw new Error("Failed to update order");
				}
				await session.commitTransaction();
				session.endSession();

				// Publish order update event (with retry logic)
				await this.publishOrderUpdate({
					...updatedOrder,
					_id: updatedOrder._id as unknown as ObjectId,
				});
			} catch (err) {
				await session.abortTransaction();
				session.endSession();
				throw err;
			}
		} catch (error) {
			this.logger.error("Webhook processing failed", {
				sessionId,
				error,
			});
			return next(createHttpError(500, "Internal server error"));
		}

		this.logger.info("Webhook successfully processed", { sessionId });
		res.json({ success: true, message: "Webhook processed" });
	};

	// Publish order update event to message broker
	private async publishOrderUpdate(order: Order & { _id: ObjectId }) {
		const message = JSON.stringify(order);
		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			try {
				await this.broker.sendMessage("order", message);
				this.logger.info("Order message published", {
					orderId: order._id,
				});
				return;
			} catch (error) {
				this.logger.warn(
					`Failed to publish order message. Retry ${
						attempt + 1
					}/${MAX_RETRIES}`,
					{
						error,
						orderId: order._id,
					},
				);
				await new Promise((resolve) =>
					setTimeout(resolve, RETRY_DELAY(attempt)),
				);
			}
		}

		// After max retries, push to Dead Letter Queue (DLQ)
		this.logger.error(
			"Failed to publish message after retries. Sending to DLQ",
			{ orderId: order._id },
		);
		await this.broker.sendMessage("order.dlq", message);
	}
}
