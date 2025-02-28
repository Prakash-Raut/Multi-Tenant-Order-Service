import config from "config";
import { KafkaBroker } from "../../config/kafka";
import type { MessageBroker } from "../../types/broker";

let broker: MessageBroker | null = null;

export const createMessageBroker = (): MessageBroker => {
	const brokers = (config.get("kafka.broker") as unknown as string[]).map(
		(givenbroker: string) => {
			return givenbroker;
		},
	);
	if (!broker) {
		broker = new KafkaBroker("order-service", brokers);
	}
	return broker;
};
