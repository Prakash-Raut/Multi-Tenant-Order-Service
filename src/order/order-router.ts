import { Router } from "express";
// import orderValidator from "./order-validator";
import { createPaymentGw } from "../common/factory/paymentFactory";
import logger from "../config/logger";
import authenticate from "../middleware/authenticate";
import { asyncHandler } from "../utils";
import { OrderController } from "./order-controller";
import { OrderService } from "./order-service";

const orderRouter = Router();
const orderService = new OrderService();
const paymentGw = createPaymentGw();
const orderController = new OrderController(orderService, logger, paymentGw);

orderRouter.post(
	"/",
	authenticate,
	// orderValidator,
	asyncHandler(orderController.create),
);

export default orderRouter;
