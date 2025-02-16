import { Schema, model } from "mongoose";

const toppingCacheModel = new Schema({
	toppingId: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

export const ToppingCacheModel = model(
	"ToppingCache",
	toppingCacheModel,
	"toppingCache",
);
