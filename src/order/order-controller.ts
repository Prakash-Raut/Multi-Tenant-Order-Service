import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import type { Logger } from "winston";
import { IdempotentModel } from "../idempotent/idempotent-model";
import type { PaymentGW } from "../payment/payment-type";
import type { OrderService } from "./order-service";
import {
	type CreateOrderRequest,
	OrderStatus,
	PaymentStatus,
} from "./order-type";

export class OrderController {
	constructor(
		private orderService: OrderService,
		private logger: Logger,
		private paymentGW: PaymentGW,
	) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		// const result = validationResult(req);
		// if (!result.isEmpty()) {
		// 	return next(createHttpError(400, result.array()[0].msg as string));
		// }

		const {
			cart,
			couponCode,
			tenantId,
			paymentMode,
			customerId,
			comment,
			address,
		} = req.body as CreateOrderRequest;

		const totalPrice = await this.orderService.calculateTotal(cart);

		let discountPercentage = 0;

		if (couponCode) {
			discountPercentage = await this.orderService.getDiscountPercentage(
				couponCode,
				tenantId,
			);
		}

		const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

		const priceAfterDiscount = totalPrice - discountAmount;

		// TODO: May be store in db for each Tenant
		const TAX_PERCENTAGE = 18;

		const taxes = Math.round((priceAfterDiscount * TAX_PERCENTAGE) / 100);

		// TODO: May be store in db for each Tenant
		const DELIVERY_CHARGE = 50;

		const finalTotal = priceAfterDiscount + taxes + DELIVERY_CHARGE;

		const idempotencyKey = req.headers["idempotency-key"] as string;

		const idempotency = await IdempotentModel.findOne({
			key: idempotencyKey,
		});

		let newOrder = {};

		if (idempotency) {
			newOrder = idempotency.response;
		} else {
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				newOrder = await this.orderService.createOrder(
					{
						cart,
						taxes,
						address,
						comment,
						tenantId,
						customerId,
						paymentMode,
						total: finalTotal,
						deliveryCharges: DELIVERY_CHARGE,
						discount: discountAmount,
						orderStatus: OrderStatus.RECEIVED,
						paymentStatus: PaymentStatus.PENDING,
					},
					session,
				);

				await IdempotentModel.create(
					[{ key: idempotencyKey, response: newOrder[0] }],
					{ session },
				);

				await session.commitTransaction();
			} catch (error) {
				await session.abortTransaction();
				this.logger.error("Error creating order", {
					error,
					cart,
					couponCode,
					tenantId,
					paymentMode,
					customerId,
					comment,
					address,
				});
				return next(createHttpError(500, { message: error }));
			} finally {
				await session.endSession();
			}
		}

		try {
			const session = await this.paymentGW.createSession({
				amount: finalTotal,
				orderId: newOrder[0]._id.toString(),
				tenantId,
				currency: "inr",
				idempotencyKey,
			});

			this.logger.info("Order created successfully", {
				orderId: newOrder[0]._id.toString(),
			});

			res.json({ paymentUrl: session.paymentUrl, paymentId: session.id });
		} catch (error) {
			this.logger.error("Error creating payment session", {
				error,
				orderId: newOrder[0]._id.toString(),
			});
			return next(createHttpError(500, "Error creating payment session"));
		}
	};
}
