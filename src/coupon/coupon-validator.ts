import { body } from "express-validator";

export default [
	body("title")
		.exists()
		.withMessage("Coupon title is required")
		.isString()
		.withMessage("Coupon title must be a string"),

	body("code")
		.exists()
		.withMessage("Coupon code is required")
		.isString()
		.withMessage("Coupon code must be a string"),

	body("discount")
		.exists()
		.withMessage("Coupon discount is required")
		.isNumeric()
		.withMessage("Coupon discount must be a number"),

	body("validUpto")
		.exists()
		.withMessage("Coupon valid upto date is required")
		.isISO8601()
		.withMessage("Coupon valid upto date must be a date"),

	body("tenantId")
		.exists()
		.withMessage("Tenant ID is required")
		.isNumeric()
		.withMessage("Tenant ID must be a number"),
];
