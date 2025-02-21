import { body } from "express-validator";

export default [
	body("status")
		.isIn([
			"received",
			"confirmed",
			"prepared",
			"out_for_delivery",
			"delivered",
		])
		.withMessage("Invalid order status"),
];
