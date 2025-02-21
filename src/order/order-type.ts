import type { FilterQuery, Types } from "mongoose";
import type { CartItem } from "../types";

export enum PaymentMode {
	CARD = "card",
	CASH = "cash",
}

export enum OrderStatus {
	RECEIVED = "received",
	CONFIRMED = "confirmed",
	PREPARED = "prepared",
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

export type GetAllOrdersFilter = FilterQuery<Order>;

export enum OrderEvents {
	ORDER_CREATE = "ORDER_CREATE",
	ORDER_UPDATE = "ORDER_UPDATE",
	PAYMENT_STATUS_UPDATE = "PAYMENT_STATUS_UPDATE",
	ORDER_STATUS_UPDATE = "ORDER_STATUS_UPDATE",
}
