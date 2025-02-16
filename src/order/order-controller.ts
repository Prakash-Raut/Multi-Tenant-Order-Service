import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import type { OrderService } from "./order-service";

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

		const { cart, couponCode, tenantId } = req.body;

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
		const TAXES_PERCENTAGE = 18;

		const taxes = Math.round((priceAfterDiscount * TAXES_PERCENTAGE) / 100);

		this.logger.info("Order created successfully", {});

		res.json({
			message: "Order created",
			subtotal: totalPrice,
			discount: discountAmount,
			tax: taxes,
		});
	};
}
