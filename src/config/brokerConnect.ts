import { createMessageBroker } from "../common/factory/brokerFactory";
import type { MessageBroker } from "../types/broker";
import logger from "./logger";

export const brokerConnect = async () => {
	let messageBroker: MessageBroker | null = null;
	try {
		messageBroker = createMessageBroker();

		await messageBroker.connectConsumer();
		await messageBroker.consumeMessage(["Product"], true);

		logger.info("Kafka Consumer connected");
	} catch (error) {
		if (error instanceof Error) {
			logger.error("Error connecting to Kafka consumer: ", error.message);
			if (messageBroker) {
				await messageBroker.disconnectConsumer();
				logger.info("Kafka consumer disconnected due to error", {
					error: error.message,
				});
			}
		}
	}
};
