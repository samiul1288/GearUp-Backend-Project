import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

// Get All Users (Admin only)
router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);

// Update Own Profile
router.patch(
  "/profile",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile,
);

// Get Single User Profile by ID
router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.PROVIDER, UserRole.CUSTOMER),
  UserController.getUserById,
);

// Update User Status (Admin only)
router.patch(
  "/status/:id",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

export const UserRoutes = router;
