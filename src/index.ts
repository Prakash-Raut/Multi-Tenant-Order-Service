import config from "config";
import app from "./app";
import { brokerConnect } from "./config/brokerConnect";
import { dbConnect } from "./config/db";
import logger from "./config/logger";

const startServer = async () => {
	const PORT: number = config.get("server.port");
	try {
		await dbConnect();
		await brokerConnect();
		app.listen(PORT, () => {
			logger.info("Server listening on port", { port: PORT });
		});
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(err.message);
			setTimeout(() => {
				process.exit(1);
			}, 1000);
		}
	}
};

void startServer();
