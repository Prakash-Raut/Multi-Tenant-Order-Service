import config from "config";
import { KafkaBroker } from "../../config/kafka";
import type { MessageBroker } from "../../types/broker";

let broker: MessageBroker | null = null;

export const createMessageBroker = (): MessageBroker => {
	if (!broker) {
		broker = new KafkaBroker("order-service", [config.get("kafka.broker")]);
	}

	return broker;
};
