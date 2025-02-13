export interface Customer {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	addresses: Address[];
}

export interface Address {
	text: string;
	isDefault: boolean;
}
