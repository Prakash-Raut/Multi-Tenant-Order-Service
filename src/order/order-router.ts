import { Router } from "express";
import logger from "../config/logger";
import authenticate from "../middleware/authenticate";
// import orderValidator from "./order-validator";
import { StripeGW } from "../payment/stripe";
import { asyncHandler } from "../utils";
import { OrderController } from "./order-controller";
import { OrderService } from "./order-service";

const orderRouter = Router();
const orderService = new OrderService();
const paymentGw = new StripeGW();
const orderController = new OrderController(orderService, logger, paymentGw);

orderRouter.post(
	"/",
	authenticate,
	// orderValidator,
	asyncHandler(orderController.create),
);

export default orderRouter;
