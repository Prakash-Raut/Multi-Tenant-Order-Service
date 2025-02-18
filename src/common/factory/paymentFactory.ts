import type { PaymentGW } from "../../payment/payment-type";
import { StripeGW } from "../../payment/stripe";

let paymentGw: PaymentGW | null = null;

export const createPaymentGw = (): PaymentGW => {
	if (!paymentGw) {
		paymentGw = new StripeGW();
	}

	return paymentGw;
};
