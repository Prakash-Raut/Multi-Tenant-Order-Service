import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import type { Logger } from "winston";
import { Roles } from "../constants";
import type { CustomerService } from "../customer/customer-service";
import { IdempotentModel } from "../idempotent/idempotent-model";
import type { PaymentGW } from "../payment/payment-type";
import type { AuthRequest } from "../types";
import type { MessageBroker } from "../types/broker";
import type { OrderService } from "./order-service";
import {
	type CreateOrderRequest,
	OrderEvents,
	OrderStatus,
	PaymentMode,
	PaymentStatus,
} from "./order-type";

export class OrderController {
	constructor(
		private orderService: OrderService,
		private logger: Logger,
		private paymentGW: PaymentGW,
		private broker: MessageBroker,
		private customerService: CustomerService,
	) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		// const result = validationResult(req);
		// if (!result.isEmpty()) {
		// 	return next(createHttpError(400, result.array()[0].msg as string));
		// }

		const {
			cart,
			couponCode,
			tenantId,
			paymentMode,
			customerId,
			comment,
			address,
		} = req.body as CreateOrderRequest;

		const totalPrice = await this.orderService.calculateTotal(cart);

		let discountPercentage = 0;

		if (couponCode) {
			discountPercentage = await this.orderService.getDiscountPercentage(
				couponCode,
				tenantId,
			);
		}

		const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

		const priceAfterDiscount = totalPrice - discountAmount;

		// TODO: May be store in db for each Tenant
		const TAX_PERCENTAGE = 18;

		const taxes = Math.round((priceAfterDiscount * TAX_PERCENTAGE) / 100);

		// TODO: May be store in db for each Tenant
		const DELIVERY_CHARGE = 50;

		const finalTotal = priceAfterDiscount + taxes + DELIVERY_CHARGE;

		const idempotencyKey = req.headers["idempotency-key"] as string;

		const idempotency = await IdempotentModel.findOne({
			key: idempotencyKey,
		});

		let newOrder = {};

		if (idempotency) {
			newOrder = idempotency.response;
		} else {
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				newOrder = await this.orderService.createOrder(
					{
						cart,
						taxes,
						address,
						comment,
						tenantId,
						customerId,
						paymentMode,
						total: finalTotal,
						deliveryCharges: DELIVERY_CHARGE,
						discount: discountAmount,
						orderStatus: OrderStatus.RECEIVED,
						paymentStatus: PaymentStatus.PENDING,
					},
					session,
				);

				await IdempotentModel.create(
					[{ key: idempotencyKey, response: newOrder[0] }],
					{ session },
				);

				await session.commitTransaction();
			} catch (error) {
				await session.abortTransaction();
				this.logger.error("Error creating order", {
					error,
					cart,
					couponCode,
					tenantId,
					paymentMode,
					customerId,
					comment,
					address,
				});
				return next(createHttpError(500, { message: error }));
			} finally {
				await session.endSession();
			}
		}

		if (paymentMode === PaymentMode.CARD) {
			try {
				const session = await this.paymentGW.createSession({
					amount: finalTotal,
					orderId: newOrder[0]?._id?.toString(),
					tenantId,
					currency: "inr",
					idempotencyKey,
				});

				const customer = await this.customerService.getCustomer(
					newOrder[0].customerId,
				);

				if (!customer) {
					return next(createHttpError(400, "No customer found"));
				}

				const brokerMessage = {
					eventType: OrderEvents.ORDER_CREATE,
					data: {
						...newOrder[0],
						customerId: customer,
					},
				};

				const message = JSON.stringify(brokerMessage);
				await this.broker.sendMessage(
					"order",
					message,
					newOrder[0]._id?.toString(),
				);

				this.logger.info("Order created successfully", {
					orderId: newOrder[0]?._id?.toString(),
				});

				res.json({
					paymentUrl: session.paymentUrl,
					paymentId: session.id,
				});
			} catch (error) {
				this.logger.error("Error creating payment session", {
					error,
					orderId: newOrder[0]?._id?.toString(),
				});
				return next(createHttpError(500, "Error creating payment session"));
			}
		} else {
			const brokerMessage = {
				eventType: OrderEvents.ORDER_CREATE,
				data: newOrder[0],
			};
			const message = JSON.stringify(brokerMessage);
			await this.broker.sendMessage(
				"order",
				message,
				newOrder[0]._id?.toString(),
			);
			res.json({ paymentUrl: null, paymentId: null });
		}
	};

	getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
		const { sub } = (req as AuthRequest).auth;

		if (!sub) {
			return next(createHttpError(400, "User not found"));
		}

		const customer = await this.customerService.getCustomer(sub);

		if (!customer) {
			return next(createHttpError(400, "No customer found"));
		}

		const orders = await this.orderService.getOrdersByCustomerId(customer.id);

		if (!orders) {
			return next(createHttpError(400, "No orders found"));
		}

		this.logger.info("Orders retrieved successfully", {
			customerId: customer.id,
		});

		res.json(orders);
	};

	getSingle = async (req: Request, res: Response, next: NextFunction) => {
		const { orderId } = req.params;
		const { sub: userId, role, tenantId } = (req as AuthRequest).auth;

		const fields = req.query.fields
			? req.query.fields.toString().split(",")
			: [];

		const projection = fields.reduce(
			(acc, field) => {
				acc[field] = 1;
				return acc;
			},
			{
				customerId: 1,
			},
		);

		const order = await this.orderService.getOrderById(orderId, projection);

		if (!order) {
			return next(createHttpError(400, "Order not found"));
		}

		if (role === Roles.ADMIN) {
			this.logger.info("Order retrieved successfully", {
				orderId: orderId,
				role: "admin",
			});
			res.json(order);
			return;
		}

		const myRestaurantOrder = order.tenantId === tenantId;

		if (role === Roles.MANAGER && myRestaurantOrder) {
			this.logger.info("Order retrieved successfully", {
				orderId: orderId,
				role: "manager",
			});
			res.json(order);
			return;
		}

		if (role === Roles.CUSTOMER) {
			const customer = await this.customerService.getCustomer(userId);
			if (!customer) {
				return next(createHttpError(400, "No customer found"));
			}
			if (customer._id === order.customerId._id) {
				this.logger.info("Order retrieved successfully", {
					orderId: orderId,
					role: "customer",
				});
				res.json(order);
				return;
			}
		}

		return next(createHttpError(403, "Unauthorized"));
	};

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		const { role, tenantId: userTenantId } = (req as AuthRequest).auth;

		const tenantId = req.query.tenantId as string;

		if (role === Roles.CUSTOMER) {
			return next(createHttpError(403, "Customer not allowed"));
		}

		const filter: { tenantId?: string } = {};

		if (role === Roles.ADMIN) {
			// Admin can filter by any tenantId, or get all if not specified
			if (tenantId) {
				filter.tenantId = tenantId;
			}
		} else if (role === Roles.MANAGER) {
			// Manager can only see orders for their tenantId
			filter.tenantId = userTenantId;
		}

		const orders = await this.orderService.getAllOrders(filter);

		this.logger.info("Orders retrieved successfully", {
			role: role.toLowerCase(),
		});

		res.json(orders);
	};

	changeStatus = async (req: Request, res: Response, next: NextFunction) => {
		const { role, tenantId } = (req as AuthRequest).auth;
		const { orderId } = req.params;

		if (role !== Roles.ADMIN && role !== Roles.MANAGER) {
			return next(createHttpError(403, "Unauthorized"));
		}

		const result = validationResult(req.body);

		if (!result.isEmpty()) {
			return next(createHttpError(400, result.array()[0].msg as string));
		}

		const { status } = req.body;

		const order = await this.orderService.getOrderById(orderId);

		if (!order) {
			return next(createHttpError(400, "Order not found"));
		}

		const isMyRestaurantOrder = order.tenantId === tenantId;

		if (role === Roles.MANAGER && !isMyRestaurantOrder) {
			return next(
				createHttpError(
					403,
					"Managers can only change the status of orders from their own restaurant",
				),
			);
		}

		const updatedOrder = await this.orderService.changeOrderStatus(
			orderId,
			status,
		);

		if (!updatedOrder) {
			return next(createHttpError(400, "Order status not changed"));
		}

		const customer = await this.customerService.getCustomer(
			updatedOrder[0].customerId,
		);

		if (!customer) {
			return next(createHttpError(400, "No customer found"));
		}

		const brokerMessage = {
			eventType: OrderEvents.ORDER_STATUS_UPDATE,
			data: {
				...updatedOrder.toObject(),
				customerId: customer,
			},
		};

		const message = JSON.stringify(brokerMessage);

		await this.broker.sendMessage(
			"order",
			message,
			updatedOrder[0]._id?.toString(),
		);

		this.logger.info("Order status changed successfully", {
			orderId,
			status,
		});

		res.json({ message: "Order status changed" });
	};
}
