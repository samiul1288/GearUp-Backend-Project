import { Router } from "express";
import { GearController } from "./gear.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import  validateRequest  from "../../middleware/validateRequest";
import { GearValidation } from "./gear.validation";

const router = Router();

// Create Gear (PROVIDER & ADMIN)
router.post(
  "/",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(GearValidation.createGearValidationSchema),
  GearController.createGear,
);

// Get All Gears with filters/search (Public)
router.get("/", GearController.getAllGears);

// Get Single Gear by ID (Public)
router.get("/:id", GearController.getGearById);

// Update Gear (PROVIDER - Owner only, or ADMIN)
router.patch(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(GearValidation.updateGearValidationSchema),
  GearController.updateGear,
);

// Delete Gear (PROVIDER - Owner only, or ADMIN)
router.delete(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  GearController.deleteGear,
);

export const GearRoutes = router;
