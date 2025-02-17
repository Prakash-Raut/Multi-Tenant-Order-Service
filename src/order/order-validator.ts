import { body } from "express-validator";

export default [
	body("cart")
		.isArray({ min: 1 })
		.withMessage("Cart must be a non-empty array"),

	body("cart.*._id")
		.isString()
		.notEmpty()
		.withMessage("Product ID (_id) is required and must be a string"),

	body("cart.*.name")
		.isString()
		.notEmpty()
		.withMessage("Product name is required and must be a string"),

	body("cart.*.image")
		.isString()
		.notEmpty()
		.withMessage("Product image is required and must be a string"),

	body("cart.*.priceConfiguration")
		.isObject()
		.withMessage("Price configuration must be an object"),

	body("cart.*.chosenConfiguration")
		.isObject()
		.withMessage("Chosen configuration is required"),

	body("cart.*.chosenConfiguration.priceConfiguration")
		.isObject()
		.withMessage(
			"Price configuration in chosenConfiguration must be an object",
		),

	body("cart.*.chosenConfiguration.priceConfiguration.*")
		.isString()
		.notEmpty()
		.withMessage("Price configuration values must be non-empty strings"),

	body("cart.*.chosenConfiguration.selectedToppings")
		.isArray()
		.withMessage("Selected toppings must be an array"),

	body("cart.*.chosenConfiguration.selectedToppings.*.id")
		.isString()
		.notEmpty()
		.withMessage("Topping ID is required and must be a string"),

	body("cart.*.chosenConfiguration.selectedToppings.*.name")
		.isString()
		.notEmpty()
		.withMessage("Topping name is required and must be a string"),

	body("cart.*.chosenConfiguration.selectedToppings.*.image")
		.isString()
		.notEmpty()
		.withMessage("Topping image is required and must be a string"),

	body("cart.*.chosenConfiguration.selectedToppings.*.price")
		.isNumeric()
		.withMessage("Topping price must be a number"),

	body("cart.*.qty")
		.isInt({ min: 1 })
		.withMessage("Quantity (qty) must be an integer greater than 0"),

	body("cart.*.hash")
		.optional()
		.isString()
		.withMessage("Hash must be a string if provided"),

	body("tenantId")
		.isString()
		.notEmpty()
		.withMessage("Tenant ID is required and must be a string"),

	body("paymentMode")
		.isIn(["card", "cash"])
		.withMessage("Payment mode must be either 'card' or 'cash'"),

	body("customerId")
		.isMongoId()
		.withMessage("Customer ID must be a valid MongoDB ObjectId"),

	body("address")
		.isString()
		.notEmpty()
		.withMessage("Address is required and must be a string"),

	body("comment")
		.optional()
		.isString()
		.withMessage("Comment must be a string if provided"),
];
