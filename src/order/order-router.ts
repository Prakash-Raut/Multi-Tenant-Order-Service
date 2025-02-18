import { Router } from "express";
// import orderValidator from "./order-validator";
import { createMessageBroker } from "../common/factory/brokerFactory";
import { createPaymentGw } from "../common/factory/paymentFactory";
import logger from "../config/logger";
import { CustomerService } from "../customer/customer-service";
import authenticate from "../middleware/authenticate";
import { asyncHandler } from "../utils";
import { OrderController } from "./order-controller";
import { OrderService } from "./order-service";

const orderRouter = Router();
const orderService = new OrderService();
const paymentGw = createPaymentGw();
const broker = createMessageBroker();
const customerService = new CustomerService();
const orderController = new OrderController(
	orderService,
	logger,
	paymentGw,
	broker,
	customerService,
);

orderRouter.post(
	"/",
	authenticate,
	// orderValidator,
	asyncHandler(orderController.create),
);

orderRouter.get("/me", authenticate, asyncHandler(orderController.getMyOrders));

export default orderRouter;
