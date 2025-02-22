import type { Request } from "express";

export type AuthCookie = {
	accessToken: string;
};

export interface AuthRequest extends Request {
	auth: {
		sub: string;
		role: string;
		id?: string;
		tenantId?: string;
		firstName: string;
		lastName: string;
		email: string;
	};
}

export interface ProductPriceConfiguration {
	priceType: "base" | "additional";
	availableOptions: {
		[key: string]: number;
	};
}

export interface ProductMessage {
	event_type: ProductEvents;
	data: {
		id: string;
		priceConfiguration: ProductPriceConfiguration;
	};
}

export interface ToppingMessage {
	event_type: ToppingEvents;
	data: {
		id: string;
		price: number;
		tenantId: string;
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
	_id: string;
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

export enum ProductEvents {
	PRODUCT_CREATE = "product_create",
	PRODUCT_UPDATE = "product_update",
	PRODUCT_DELETE = "product_delete",
}

export enum ToppingEvents {
	TOPPING_CREATE = "topping_create",
	TOPPING_UPDATE = "topping_update",
	TOPPING_DELETE = "topping_delete",
}
