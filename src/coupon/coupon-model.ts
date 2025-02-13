import { Schema, model } from "mongoose";
import type { Coupon } from "./coupon-type";

const couponSchema = new Schema<Coupon>(
	{
		title: { type: String, required: true },
		code: { type: String, required: true },
		discount: { type: Number, required: true },
		validUpto: { type: Date, required: true },
		tenantId: { type: Number, required: true },
	},
	{ timestamps: true },
);

couponSchema.index({ code: 1, tenantId: 1 }, { unique: true });

export const CouponModel = model<Coupon>("Coupon", couponSchema);
