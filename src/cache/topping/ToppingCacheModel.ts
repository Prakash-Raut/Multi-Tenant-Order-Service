import { Schema, type Types, model } from "mongoose";

export interface ToppingPricingCache {
	_id: Types.ObjectId;
	toppingId: string;
	price: number;
	tenantId: string;
}

const toppingCacheModel = new Schema<ToppingPricingCache>({
	toppingId: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	tenantId: {
		type: String,
		required: true,
	},
});

export const ToppingCacheModel = model(
	"ToppingCache",
	toppingCacheModel,
	"toppingCache",
);
