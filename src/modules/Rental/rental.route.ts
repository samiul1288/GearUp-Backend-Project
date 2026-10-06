import { Router } from "express";
import { RentalController } from "./rental.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import  validateRequest  from "../../middleware/validateRequest";
import { RentalValidation } from "./rental.validation";

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
