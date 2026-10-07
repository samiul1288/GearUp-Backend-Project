import { Router } from "express";
import { AuthController }  from "./auth.controller.js";
import  validateRequest  from "../../middleware/validateRequest.js";
import { auth } from "../../middleware/auth.js";
import { AuthValidations } from "./auth.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidations.registerValidationSchema),
  AuthController.registerUser,
);

router.post(
  "/login",
  validateRequest(AuthValidations.loginValidationSchema),
  AuthController.loginUser,
);

router.get(
  "/me",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  AuthController.getMe,
);

export const AuthRoutes = router;
