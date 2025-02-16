import { type Consumer, type EachMessagePayload, Kafka } from "kafkajs";
import { handleProductUpdate } from "../cache/product/handleProductUpdate";
import { handleToppingUpdate } from "../cache/topping/handleToppingUpdate";
import type { MessageBroker } from "../types/broker";

/**
 * KafkaBroker class implements the MessageBroker interface to interact with Kafka.
 */
export class KafkaBroker implements MessageBroker {
	/**
	 * The Kafka consumer instance.
	 */
	private consumer: Consumer;

	/**
	 * Creates an instance of KafkaBroker.
	 * @param clientId - The client ID for the Kafka instance.
	 * @param brokers - An array of broker addresses.
	 */
	constructor(clientId: string, brokers: string[]) {
		const kafka = new Kafka({ clientId, brokers });

		this.consumer = kafka.consumer({ groupId: clientId });
	}

	/**
	 * Connects the Kafka consumer.
	 * @returns A promise that resolves when the consumer is connected.
	 */
	connectConsumer = async () => {
		await this.consumer.connect();
	};

	/**
	 * Disconnects the Kafka consumer.
	 * @returns A promise that resolves when the consumer is disconnected.
	 */
	disconnectConsumer = async () => {
		if (this.consumer) {
			await this.consumer.disconnect();
		}
	};

	/**
	 * Consumes messages from a specified Kafka topic.
	 * @param topic - The topic to consume messages from.
	 * @param fromBeginning - Whether to consume messages from the beginning of the topic.
	 * @returns A promise that resolves when the consumer is set up to consume messages.
	 */
	consumeMessage = async (topics: string[], fromBeginning = false) => {
		await this.consumer.subscribe({ topics, fromBeginning });
		await this.consumer.run({
			eachMessage: async ({
				topic,
				partition,
				message,
			}: EachMessagePayload) => {
				if (!message.value) {
					return;
				}

				switch (topic) {
					case "Product":
						await handleProductUpdate(message.value.toString());
						return;
					case "Topping":
						await handleToppingUpdate(message.value.toString());
						return;
					default:
						console.log("Do Nothing");
				}

				console.log({
					value: message.value?.toString(),
					topic,
					partition,
				});
			},
		});
	};
}
