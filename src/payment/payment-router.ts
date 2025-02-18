import { Router } from "express";
import logger from "../config/logger";
import { asyncHandler } from "../utils";
import { PaymentController } from "./payment-controller";
import { StripeGW } from "./stripe";

const paymentRouter = Router();
const paymentGw = new StripeGW();
const paymentController = new PaymentController(paymentGw, logger);

paymentRouter.post("/webhook", asyncHandler(paymentController.handleWebhook));

export default paymentRouter;
