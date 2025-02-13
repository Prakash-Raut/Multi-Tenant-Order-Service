import { Router } from "express";
import logger from "../config/logger";
import { Roles } from "../constants";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { asyncHandler } from "../utils";
import { CouponController } from "./coupon-controller";
import { CouponService } from "./coupon-service";
import couponValidator from "./coupon-validator";

const couponRouter = Router();
const couponService = new CouponService();
const couponController = new CouponController(couponService, logger);

couponRouter.post(
	"/",
	authenticate,
	canAccess([Roles.ADMIN, Roles.MANAGER]),
	couponValidator,
	asyncHandler(couponController.create),
);

couponRouter.post(
	"/verify",
	authenticate,
	asyncHandler(couponController.verify),
);

couponRouter.patch(
	"/:id",
	authenticate,
	canAccess([Roles.ADMIN, Roles.MANAGER]),
	couponValidator,
	asyncHandler(couponController.update),
);

couponRouter.get(
	"/",
	authenticate,
	canAccess([Roles.ADMIN, Roles.MANAGER]),
	asyncHandler(couponController.getAll),
);

couponRouter.get(
	"/:id",
	authenticate,
	canAccess([Roles.ADMIN, Roles.MANAGER]),
	asyncHandler(couponController.getOne),
);

couponRouter.delete(
	"/:id",
	authenticate,
	canAccess([Roles.ADMIN, Roles.MANAGER]),
	asyncHandler(couponController.delete),
);

export default couponRouter;
