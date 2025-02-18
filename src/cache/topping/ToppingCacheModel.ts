import { Schema, model } from "mongoose";

export interface ToppingPricingCache {
	toppingId: string;
	price: number;
	tenantId: string;
}

const toppingCacheSchema = new Schema<ToppingPricingCache>({
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
	toppingCacheSchema,
	"toppingCache",
);
