import { Router } from "express";
import { RentalController } from "./rental.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import  validateRequest  from "../../middleware/validateRequest.js";
import { RentalValidation } from "./rental.validation.js";

const router = Router();

// Create Rental (Customer only)
router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(RentalValidation.createRentalValidationSchema),
  RentalController.createRental,
);

// Get My Rentals / Provider Rentals / All Rentals
router.get(
  "/",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  RentalController.getMyRentals,
);

// Get Single Rental by ID
router.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  RentalController.getRentalById,
);

// Update Rental Status (PROVIDER or ADMIN)
router.patch(
  "/:id/status",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(RentalValidation.updateRentalStatusValidationSchema),
  RentalController.updateRentalStatus,
);

export const RentalRoutes = router;
