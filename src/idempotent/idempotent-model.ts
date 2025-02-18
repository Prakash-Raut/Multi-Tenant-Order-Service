import { Schema, model } from "mongoose";
import type { Idempotent } from "./idempotent-type";

const idempotentSchema = new Schema<Idempotent>(
	{
		key: {
			type: String,
			index: true,
			unique: true,
			required: true,
		},
		response: {
			type: Object,
			required: true,
		},
	},
	{ timestamps: true },
);

idempotentSchema.index(
	{ createdAt: 1 },
	{ expireAfterSeconds: 60 * 60 * 24 * 2 },
);

export const IdempotentModel = model<Idempotent>(
	"Idempotent",
	idempotentSchema,
);
