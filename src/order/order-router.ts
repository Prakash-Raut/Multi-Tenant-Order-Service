import { Router } from "express";
import logger from "../config/logger";
import authenticate from "../middleware/authenticate";
import { asyncHandler } from "../utils";
import { OrderController } from "./order-controller";
import { OrderService } from "./order-service";
import orderValidator from "./order-validator";

const orderRouter = Router();
const orderService = new OrderService();
const orderController = new OrderController(orderService, logger);

orderRouter.post(
	"/",
	authenticate,
	// orderValidator,
	asyncHandler(orderController.create),
);

export default orderRouter;
