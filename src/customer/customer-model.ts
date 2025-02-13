import { Schema, model } from "mongoose";
import type { Address, Customer } from "./customer-type";

const addressSchema = new Schema<Address>(
	{
		text: { type: String, required: true },
		isDefault: { type: Boolean, required: false, default: false },
	},
	{ _id: false },
);

const customerSchema = new Schema<Customer>(
	{
		userId: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true },
		addresses: {
			type: [addressSchema],
			required: false,
		},
	},
	{ timestamps: true },
);

export const CustomerModel = model<Customer>("Customer", customerSchema);
