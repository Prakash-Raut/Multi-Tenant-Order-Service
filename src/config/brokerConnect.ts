import { createMessageBroker } from "../common/factory/brokerFactory";
import type { MessageBroker } from "../types/broker";
import logger from "./logger";
import { TOPIC } from "./topic";

export const brokerConnect = async () => {
	let messageBroker: MessageBroker | null = null;
	try {
		messageBroker = createMessageBroker();
		await messageBroker.connectProducer();
		await messageBroker.connectConsumer();
		await messageBroker.consumeMessage([TOPIC.PRODUCT, TOPIC.TOPPING], false);

		logger.info("Kafka connected");
	} catch (error) {
		if (error instanceof Error) {
			logger.error("Error connecting to Kafka: ", error.message);
			if (messageBroker) {
				await messageBroker.disconnectProducer();
				await messageBroker.disconnectConsumer();
				logger.info("Kafka disconnected due to error", {
					error: error.message,
				});
			}
		}
	}
};
