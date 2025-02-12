import config from "config";
import { connect } from "mongoose";
import logger from "./logger";

export const dbConnect = async () => {
	try {
		await connect(config.get("database.url"));
		logger.info("Database connected successfully!");
	} catch (error) {
		logger.error("Database connection failed!", error);
		process.exit(1);
	}
};
