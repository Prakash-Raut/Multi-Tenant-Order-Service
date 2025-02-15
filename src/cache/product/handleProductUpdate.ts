import type { ProductMessage } from "../../types";
import { ProductCacheModel } from "./ProductCacheModel";

export const handleProductUpdate = async (value: string) => {
	try {
		const product: ProductMessage = JSON.parse(value);

		await ProductCacheModel.updateOne(
			{ productId: product.id },
			{
				$set: {
					priceConfiguration: product.priceConfiguration,
				},
			},
			{ upsert: true },
		);
	} catch (error) {
		console.error(`Error parsing product: ${error}`);
	}
};
