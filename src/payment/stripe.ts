import config from "config";
import { Stripe } from "stripe";
import type {
	CustomMetadata,
	PaymentGW,
	PaymentOptions,
	VerifiedSession,
} from "./payment-type";

export class StripeGW implements PaymentGW {
	private stripe: Stripe;
	constructor() {
		this.stripe = new Stripe(config.get("stripe.secretKey"));
	}

	createSession = async (options: PaymentOptions) => {
		const session = await this.stripe.checkout.sessions.create(
			{
				// TODO: GET customer email from the request
				// customer_email: options.email,
				metadata: {
					orderId: options.orderId,
				},
				billing_address_collection: "required",
				// TODO: Add dynamic customer details here
				// payment_intent_data: {
				// 	shipping: {
				// 		name: "Prakash Raut",
				// 		address: {
				// 			line1: "H 205 Siddhivinayak Towers",
				// 			city: "New Delhi",
				// 			postal_code: "110091",
				// 			state: "Delhi",
				// 			country: "India",
				// 		},
				// 	}
				// },
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

		const verifiedSession: VerifiedSession = {
			id: session.id,
			paymentStatus: session.payment_status,
			metadata: session.metadata as unknown as CustomMetadata,
		};

		return verifiedSession;
	};
}
