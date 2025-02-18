import config from "config";
import { Stripe } from "stripe";
import type { PaymentGW, PaymentOptions } from "./payment-type";

export class StripeGW implements PaymentGW {
	private stripe: Stripe;
	constructor() {
		this.stripe = new Stripe(config.get("stripe.secretKey"));
	}

	createSession = async (options: PaymentOptions) => {
		const session = await this.stripe.checkout.sessions.create(
			{
				metadata: {
					orderId: options.orderId,
				},
				line_items: [
					{
						price_data: {
							currency: options.currency ?? "inr",
							product_data: {
								name: "Online Pizza Order",
								description: "Total amount to be paid",
								images: ["https://placehold.jp/150x150.png"],
							},
							unit_amount: options.amount * 100, // Stripe expects amount in paisa
						},
						quantity: 1,
					},
				],
				mode: "payment",
				success_url: `${config.get(
					"frontend.client",
				)}/payment/success=true&orderId=${options.orderId}`,
				cancel_url: `${config.get(
					"frontend.client",
				)}/payment/success=false&orderId=${options.orderId}`,
			},
			{
				idempotencyKey: options.idempotencyKey,
			},
		);

		return {
			id: session.id,
			paymentUrl: session.url ?? "",
			paymentStatus: session.payment_status,
		};
	};

	getSession = async (sessionId: string) => {
		const session = await this.stripe.checkout.sessions.retrieve(sessionId);

		return {
			id: session.id,
			metadata: {
				orderId: session.metadata?.orderId ?? "",
				...session.metadata,
			},
			paymentStatus: session.payment_status,
		};
	};
}
