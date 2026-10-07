import { Router } from "express";
import { UserController } from "./user.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { UserValidation } from "./user.validation.js";
import validateRequest from "../../middleware/validateRequest.js";

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
