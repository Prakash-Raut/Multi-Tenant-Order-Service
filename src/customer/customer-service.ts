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

	addAddress = async (customer: AddAddress) => {
		const updatedCustomerAddress = await CustomerModel.findOneAndUpdate(
			{
				_id: customer.customerId,
				userId: customer.userId,
			},
			{
				$push: {
					addresses: {
						text: customer.address,
					},
				},
			},
			{
				new: true,
			},
		);

		return updatedCustomerAddress;
	};
}

interface AddAddress {
	userId: string;
	customerId: string;
	address: string;
}
