import type { NextFunction, Response } from "express";
import type { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import type { AuthRequest } from "../types";
import type { CouponService } from "./coupon-service";

export class CouponController {
	constructor(
		private couponService: CouponService,
		private logger: Logger,
	) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		const result = validationResult(req);

		if (!result.isEmpty()) {
			return next(createHttpError(400, result.array()[0].msg as string));
		}

		const { title, code, discount, validUpto, tenantId } = req.body;

		const coupon = await this.couponService.create({
			title,
			code,
			discount,
			validUpto,
			tenantId: +tenantId,
		});

		if (!coupon) {
			return next(createHttpError(400, "Coupon not created"));
		}

		this.logger.info(`Coupon created: ${coupon._id}`);
		res.json(coupon);
	};

	verify = async (req: Request, res: Response, next: NextFunction) => {
		const { code, tenantId } = req.body;

		const coupon = await this.couponService.verify(code, +tenantId);

		if (!coupon) {
			return next(createHttpError(404, "Coupon not found"));
		}

		const currentDate = new Date();
		const couponDate = new Date(coupon.validUpto);

		if (currentDate <= couponDate) {
			res.json({ valid: true, discount: coupon.discount });
			return;
		}

		res.json({ valid: false, discount: 0 });
	};

	update = async (req: Request, res: Response, next: NextFunction) => {};

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		const { tenantId } = (req as AuthRequest).auth;

		if (!tenantId) {
			return next(createHttpError(400, "Tenant ID not provided"));
		}

		const coupons = await this.couponService.getAll(Number(tenantId));

		if (!coupons) {
			return next(createHttpError(404, "Coupons not found"));
		}

		res.json(coupons);
	};

	getOne = async (req: Request, res: Response, next: NextFunction) => {
		const { id: couponId } = req.params;

		const coupon = await this.couponService.getOne(couponId);

		if (!coupon) {
			return next(createHttpError(404, "Coupon not found"));
		}

		res.json(coupon);
	};

	delete = async (req: Request, res: Response, next: NextFunction) => {
		const { id: couponId } = req.params;

		const deletedCoupon = await this.couponService.delete(couponId);

		if (!deletedCoupon) {
			return next(createHttpError(404, "Coupon not found"));
		}

		res.json(deletedCoupon);
	};
}
