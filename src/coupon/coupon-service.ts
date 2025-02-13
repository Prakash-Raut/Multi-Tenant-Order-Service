import { CouponModel } from "./coupon-model";
import type { Coupon } from "./coupon-type";

export class CouponService {
	create = async (coupon: Coupon) => {
		const newCoupon = await CouponModel.create(coupon);
		return newCoupon;
	};

	verify = async (code: string, tenantId: number) => {
		const coupon = await CouponModel.findOne({ code, tenantId });
		return coupon;
	};

	update = async (couponId: string, coupon: Coupon) => {
		const updatedCoupon = await CouponModel.findByIdAndUpdate(
			{ _id: couponId },
			coupon,
			{ new: true },
		);
		return updatedCoupon;
	};

	getAll = async (tenantId: number) => {
		const coupons = await CouponModel.find({ tenantId });
		return coupons;
	};

	getOne = async (couponId: string) => {
		const coupon = await CouponModel.findOne({ _id: couponId });
		return coupon;
	};

	delete = async (couponId: string) => {
		const deletedCoupon = await CouponModel.findByIdAndDelete({
			_id: couponId,
		});
		return deletedCoupon;
	};
}
