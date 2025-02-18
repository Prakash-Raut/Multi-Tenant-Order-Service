import { Schema, model } from "mongoose";
import type { CartItem, Topping } from "../types";
import {
	type Order,
	OrderStatus,
	PaymentMode,
	PaymentStatus,
} from "./order-type";

const toppingSchema = new Schema<Topping>({
	// id: {
	// 	type: String,
	// 	required: true,
	// },
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

const cartSchema = new Schema<CartItem>({
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	qty: {
		type: Number,
		required: true,
	},
	priceConfiguration: {
		type: Map,
		of: {
			priceType: {
				type: String,
				enum: ["base", "additional"],
				required: true,
			},
			availableOptions: {
				type: Map,
				of: Number,
				required: true,
			},
		},
		required: true,
	},
	chosenConfiguration: {
		priceConfiguration: {
			type: Map,
			of: String,
			required: true,
		},
		selectedToppings: [
			{
				type: [toppingSchema],
				required: true,
			},
		],
	},
});

const orderSchema = new Schema<Order>(
	{
		cart: {
			type: [cartSchema],
			required: true,
		},
		customerId: {
			type: Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		total: {
			type: Number,
			required: true,
		},
		discount: {
			type: Number,
			required: true,
		},
		taxes: {
			type: Number,
			required: true,
		},
		deliveryCharges: {
			type: Number,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		tenantId: {
			type: String,
			required: true,
		},
		comment: {
			type: String,
		},
		paymentMode: {
			type: String,
			enum: PaymentMode,
			required: true,
		},
		orderStatus: {
			type: String,
			enum: OrderStatus,
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: PaymentStatus,
			required: true,
		},
		paymentReference: {
			type: String,
			required: false,
			default: null,
		},
	},
	{ timestamps: true },
);

export const OrderModel = model<Order>("Order", orderSchema);
