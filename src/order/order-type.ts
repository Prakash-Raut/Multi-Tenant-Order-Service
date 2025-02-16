import type { Types } from "mongoose";
import type { CartItem } from "../types";

export enum PaymentMode {
	CARD = "card",
	CASH = "cash",
}

export enum OrderStatus {
	RECEIVED = "received",
	CONFIRMED = "confirmed",
	PREPARING = "preparing",
	READY_FOR_DELIVERY = "ready_for_delivery",
	OUT_FOR_DELIVERY = "out_for_delivery",
	DELIVERED = "delivered",
}

export enum PaymentStatus {
	PENDING = "pending",
	PAID = "paid",
	FAILED = "failed",
}

export interface Order {
	cart: CartItem[];
	customerId: Types.ObjectId;
	total: number;
	discount: number;
	taxes: number;
	deliveryCharges: number;
	address: string;
	tenantId: string;
	comment?: string;
	paymentMode: PaymentMode;
	orderStatus: OrderStatus;
	paymentStatus: PaymentStatus;
	paymentReference?: string;
}

export interface CreateOrderRequest {
	cart: CartItem[];
	couponCode?: string;
	tenantId: string;
	paymentMode: PaymentMode;
	customerId: Types.ObjectId;
	address: string;
	comment?: string;
}
