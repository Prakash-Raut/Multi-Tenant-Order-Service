import config from "config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import couponRouter from "./coupon/coupon-router";
import customerRouter from "./customer/customer-router";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app = express();

app.use(
	cors({
		origin: config.get("client.url"),
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.json({ message: config.get("server.port") });
});

app.use("/customers", customerRouter);
app.use("/coupons", couponRouter);

app.use(globalErrorHandler);

export default app;
