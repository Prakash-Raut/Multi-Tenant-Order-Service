import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import { OrderModel } from "../order/order-model";
import { PaymentStatus } from "../order/order-type";
import type { PaymentGW } from "./payment-type";

export class PaymentController {
	constructor(
		private paymentGw: PaymentGW,
		private logger: Logger,
	) {}

	handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
		const webHookBody = req.body;

		if (webHookBody.type === "checkout.session.completed") {
			const verifiedSession = await this.paymentGw.getSession(
				webHookBody.data.object.id,
			);

			const isPaymentSuccessful = verifiedSession.paymentStatus === "paid";

			const updatedOrder = await OrderModel.updateOne(
				{
					_id: verifiedSession.metadata.orderId,
				},
				{
					paymentStatus: isPaymentSuccessful
						? PaymentStatus.PAID
						: PaymentStatus.FAILED,
				},
				{ new: true },
			);

			if (!updatedOrder) {
				return next(
					createHttpError(
						404,
						"Order not found or failed to update payment status",
					),
				);
			}

			// TODO: Send update to kafka broker
		}

		this.logger.info("Webhook received", {});

		res.json({ success: true, message: "Webhook received" });
	};
}
