import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import type { Logger } from "winston";
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
	) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		const result = validationResult(req);
		if (!result.isEmpty()) {
			return next(createHttpError(400, result.array()[0].msg as string));
		}

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

		const newOrder = await this.orderService.createOrder({
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
		});

		this.logger.info("Order created successfully", {
			orderId: newOrder._id,
		});

		res.json(newOrder);
	};
}
