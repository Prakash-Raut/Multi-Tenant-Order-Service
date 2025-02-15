import { Schema, model } from "mongoose";
import type { ProductPriceConfiguration } from "../../types";

export interface ProductPricingCache {
	productId: string;
	priceConfiguration: ProductPriceConfiguration;
}

const priceSchema = new Schema<ProductPriceConfiguration>({
	priceType: {
		type: String,
		enum: ["base", "additional"],
		required: true,
	},
	availableOptions: {
		type: Object,
		of: Number,
	},
});

const productCacheModel = new Schema<ProductPricingCache>({
	productId: {
		type: String,
		required: true,
	},
	priceConfiguration: {
		type: Object,
		of: priceSchema,
	},
});

export const ProductCacheModel = model<ProductPricingCache>(
	"ProductPricingCache",
	productCacheModel,
	"productCache",
);
