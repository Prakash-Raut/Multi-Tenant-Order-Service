import { Router } from "express";
import { createMessageBroker } from "../common/factory/brokerFactory";
import { createPaymentGw } from "../common/factory/paymentFactory";
import logger from "../config/logger";
import { asyncHandler } from "../utils";
import { PaymentController } from "./payment-controller";

const paymentRouter = Router();
const paymentGw = createPaymentGw();
const broker = createMessageBroker();
const paymentController = new PaymentController(paymentGw, logger, broker);

paymentRouter.post("/webhook", asyncHandler(paymentController.handleWebhook));

export default paymentRouter;
