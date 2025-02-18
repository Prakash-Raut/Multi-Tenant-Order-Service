import type { ToppingMessage } from "../../types";
import { ToppingCacheModel } from "./ToppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
	try {
		const topping: ToppingMessage = JSON.parse(value);
		await ToppingCacheModel.updateOne(
			{ toppingId: topping.id },
			{
				$set: {
					price: topping.price,
				},
			},
			{ upsert: true },
		);
	} catch (error) {
		console.error(`Error parsing topping: ${error}`);
	}
};
