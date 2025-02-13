import type { NextFunction, Response } from "express";
import type { Request } from "express-jwt";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import type { AuthRequest } from "../common/types";
import type { CustomerService } from "./customer-service";

export class CustomerController {
	constructor(
		private customerService: CustomerService,
		private logger: Logger,
	) {}

	get = async (req: Request, res: Response, next: NextFunction) => {
		const {
			sub: userId,
			firstName,
			lastName,
			email,
		} = (req as AuthRequest).auth;

		const customer = await this.customerService.getCustomer(userId);

		if (!customer) {
			const newCustomer = await this.customerService.createCustomer({
				userId,
				firstName,
				lastName,
				email,
				addresses: [],
			});

			if (!newCustomer) {
				return next(createHttpError(500, "Failed to create customer"));
			}

			this.logger.info(`New customer created: ${newCustomer.userId}`);
			res.json(newCustomer);
		}

		this.logger.info(`Customer found: ${customer?.userId}`);
		res.json(customer);
	};
}
