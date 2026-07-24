import { Router } from "express";
import { AuthController }  from "./auth.controller";
import  validateRequest  from "../../middleware/validateRequest";
import { auth } from "../../middleware/auth";
import { AuthValidations } from "./auth.validation";
import { UserRole } from "../../../generated/prisma/enums";

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
