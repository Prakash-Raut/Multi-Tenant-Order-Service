import { Router } from "express";
import logger from "../config/logger";
import authenticate from "../middleware/authenticate";
import { asyncHandler } from "../utils";
import { CustomerController } from "./customer-controller";
import { CustomerService } from "./customer-service";

const customerRouter = Router();
const customerService = new CustomerService();
const customerController = new CustomerController(customerService, logger);

customerRouter.get("/", authenticate, asyncHandler(customerController.get));

customerRouter.patch(
	"/addresses/:id",
	authenticate,
	asyncHandler(customerController.addAddress),
);

export default customerRouter;
