export interface ProductPriceConfiguration {
	[key: string]: {
		priceType: "base" | "additional";
		availableOptions: {
			[key: string]: number;
		};
	};
}

export interface Product {
	_id: string;
	name: string;
	description: string;
	image: string;
	priceConfiguration: ProductPriceConfiguration;
}

export interface Topping {
	id: string;
	name: string;
	image: string;
	price: number;
}

export interface CartItem
	extends Pick<Product, "_id" | "name" | "image" | "priceConfiguration"> {
	chosenConfiguration: {
		priceConfiguration: {
			[key: string]: string;
		};
		selectedToppings: Topping[];
	};
	qty: number;
	hash?: string;
}
