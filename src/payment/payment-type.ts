export interface PaymentOptions {
	currency?: "inr";
	amount: number;
	orderId: string;
	tenantId: string;
	idempotencyKey?: string;
}

type GatewayPaymentStatus = "no_payment_required" | "paid" | "unpaid";

interface PaymentSession {
	id: string;
	paymentUrl: string;
	paymentStatus: GatewayPaymentStatus;
}

interface CustomMetadata {
	orderId: string;
}

interface VerifiedPaymentSession {
	id: string;
	metadata: CustomMetadata;
	paymentStatus: GatewayPaymentStatus;
}

export interface PaymentGW {
	createSession: (options: PaymentOptions) => Promise<PaymentSession>;
	getSession: (sessionId: string) => Promise<VerifiedPaymentSession>;
}
