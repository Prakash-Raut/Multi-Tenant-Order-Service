import { Router } from "express";
import { createPaymentGw } from "../common/factory/paymentFactory";
import logger from "../config/logger";
import { asyncHandler } from "../utils";
import { PaymentController } from "./payment-controller";

const paymentRouter = Router();
const paymentGw = createPaymentGw();
const paymentController = new PaymentController(paymentGw, logger);

paymentRouter.post("/webhook", asyncHandler(paymentController.handleWebhook));

export default paymentRouter;
