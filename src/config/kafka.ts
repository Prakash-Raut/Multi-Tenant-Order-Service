import {
	type Consumer,
	type EachMessagePayload,
	Kafka,
	type Producer,
} from "kafkajs";
import { handleProductUpdate } from "../cache/product/handleProductUpdate";
import { handleToppingUpdate } from "../cache/topping/handleToppingUpdate";
import type { MessageBroker } from "../types/broker";
import { TOPIC } from "./topic";

/**
 * KafkaBroker class implements the MessageBroker interface to interact with Kafka.
 */
export class KafkaBroker implements MessageBroker {
	private consumer: Consumer;
	private producer: Producer;

	/**
	 * Creates an instance of KafkaBroker.
	 * @param clientId - The client ID for the Kafka instance.
	 * @param brokers - An array of broker addresses.
	 */
	constructor(clientId: string, brokers: string[]) {
		const kafka = new Kafka({ clientId, brokers });

		this.producer = kafka.producer();
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
	 * Connects the Kafka producer.
	 * @returns A promise that resolves when the producer is connected.
	 */
	connectProducer = async () => {
		await this.producer.connect();
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
	 * Disconnects the Kafka producer.
	 * @returns A promise that resolves when the producer is disconnected.
	 */
	disconnectProducer = async () => {
		if (this.producer) {
			await this.producer.disconnect();
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
					case TOPIC.PRODUCT:
						await handleProductUpdate(message.value.toString());
						return;
					case TOPIC.TOPPING:
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

	/**
	 * Sends a message to a specified Kafka topic.
	 * @param topic - The topic to send the message to.
	 * @param message - The message to send.
	 * @returns A promise that resolves when the message is sent.
	 */
	sendMessage = async (topic: string, message: string, key?: string) => {
		const data: { value: string; key?: string } = {
			value: message,
		};

		if (key) {
			data.key = key;
		}

		await this.producer.send({
			topic,
			messages: [data],
		});
	};
}
