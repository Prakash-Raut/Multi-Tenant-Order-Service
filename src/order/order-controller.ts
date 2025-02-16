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

		this.logger.info(
			`Order created with total price: ${totalPrice}, discount: ${discountAmount}`,
		);

		res.json({
			message: "Order created",
			orderTotal: totalPrice,
			discount: discountAmount,
		});
	};
}
