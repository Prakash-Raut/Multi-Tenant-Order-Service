import {
	ProductCacheModel,
	type ProductPricingCache,
} from "../cache/product/ProductCacheModel";
import {
	ToppingCacheModel,
	type ToppingPricingCache,
} from "../cache/topping/ToppingCacheModel";
import { CouponModel } from "../coupon/coupon-model";
import type { CartItem, Topping } from "../types";

export class OrderService {
	/**
	 * Calculates the total price of the cart.
	 * @param {CartItem[]} cart - Array of cart items
	 * @returns {Promise<number>} - Total price of the order
	 */
	calculateTotal = async (cart: CartItem[]): Promise<number> => {
		const productIds = cart.map((item) => item._id);

		// Fetch product pricing from cache
		const productPricing = await ProductCacheModel.find({
			productId: { $in: productIds },
		});

		// Handle missing products in cache by fetching from catalog service
		if (productPricing.length !== productIds.length) {
			// TODO: Integrate a catalog service call
			throw new Error("Some products are missing in cache");
		}

		const toppingIds: string[] = [];

		for (const item of cart) {
			for (const topping of item.chosenConfiguration.selectedToppings) {
				toppingIds.push(topping.id);
			}
		}

		// TC: O(n^2) - Can be optimized
		// const toppingIds = cart.reduce<string[]>((acc, item) => {
		// 	return [
		// 		...acc,
		// 		...item.chosenConfiguration.selectedToppings.map(
		// 			(topping) => topping.id,
		// 		),
		// 	];
		// }, []);

		// Fetch topping pricing from cache
		const toppingPricing = await ToppingCacheModel.find({
			toppingId: { $in: toppingIds },
		});

		const totalPrice = cart.reduce((acc, curr) => {
			const cachedProductPrice = productPricing.find(
				(product) => product.productId === curr._id,
			);

			if (!cachedProductPrice) {
				throw new Error(`Product ${curr._id} not found in cache`);
			}

			return (
				acc +
				curr.qty * this.getItemTotal(curr, cachedProductPrice, toppingPricing)
			);
		}, 0);

		return totalPrice;
	};

	/**
	 * Computes the total price for a single cart item, including product and topping prices.
	 * @param {CartItem} item - The cart item
	 * @param {ProductPricingCache} cachedProductPrice - Cached product pricing details
	 * @param {ToppingPricingCache[]} toppingPricing - Cached topping pricing details
	 * @returns {number} - Total price for the cart item
	 */
	private getItemTotal = (
		item: CartItem,
		cachedProductPrice: ProductPricingCache,
		toppingPricing: ToppingPricingCache[],
	): number => {
		const toppingTotal = item.chosenConfiguration.selectedToppings.reduce(
			(acc, curr) => {
				return acc + this.getCurrentToppingPrice(curr, toppingPricing);
			},
			0,
		);

		const productTotal = Object.entries(
			item.chosenConfiguration.priceConfiguration,
		).reduce((acc, [key, value]) => {
			const price =
				cachedProductPrice.priceConfiguration[key].availableOptions[value];

			if (price === undefined) {
				throw new Error(`Invalid price configuration for ${key}`);
			}

			return acc + price;
		}, 0);

		return productTotal + toppingTotal;
	};

	/**
	 * Retrieves the current price of a topping from cache.
	 * If the topping is missing in cache, it returns the default price.
	 * @param {Topping} topping - The topping item
	 * @param {ToppingPricingCache[]} toppingPricing - Cached topping pricing details
	 * @returns {number} - Price of the topping
	 */
	private getCurrentToppingPrice = (
		topping: Topping,
		toppingPricing: ToppingPricingCache[],
	): number => {
		const currentTopping = toppingPricing.find(
			(current) => current.toppingId === topping.id,
		);

		if (!currentTopping) {
			// If topping is missing in cache, return the default price from the cart
			return topping.price;
		}

		return currentTopping.price;
	};

	/**
	 * Calculates the discount percentage for a coupon code.
	 * @param {string} couponCode - The coupon code
	 * @param {string} tenantId - The tenant ID
	 * @returns {Promise<number>} - Discount percentage
	 */
	getDiscountPercentage = async (
		couponCode: string,
		tenantId: string,
	): Promise<number> => {
		const code = await CouponModel.findOne({ code: couponCode, tenantId });

		if (!code) {
			return 0;
		}

		const currentDate = new Date();
		const couponDate = new Date(code.validUpto);

		if (currentDate <= couponDate) {
			return code.discount;
		}

		return 0;
	};
}
