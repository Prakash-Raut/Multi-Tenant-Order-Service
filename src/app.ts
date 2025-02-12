import config from "config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app = express();

app.use(
	cors({
		origin: config.get("client.url"),
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.json({ message: config.get("server.port") });
});

app.use(globalErrorHandler);

export default app;
