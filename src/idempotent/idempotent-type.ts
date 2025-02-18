import type { CartItem } from "../types";

export interface Idempotent {
	key: string;
	response: IdempotentResponse;
}

interface IdempotentResponse {
	cart: CartItem[];
	customerId: string;
	total: number;
	discount: number;
	taxes: number;
	deliveryCharges: number;
	address: string;
	tenantId: string;
	comment: string;
	paymentMode: string;
	orderStatus: string;
	paymentStatus: string;
	paymentReference: string | null;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
