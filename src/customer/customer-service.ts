import { CustomerModel } from "./customer-model";
import type { Customer } from "./customer-type";

export class CustomerService {
	createCustomer = async (customer: Customer) => {
		const newCustomer = await CustomerModel.create(customer);
		return newCustomer;
	};

	getCustomer = async (userId: string) => {
		const customer = await CustomerModel.findOne({ userId });
		return customer;
	};
}
