import { Router } from "express";
import { GearController } from "./gear.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import  validateRequest  from "../../middleware/validateRequest.js";
import { GearValidation } from "./gear.validation.js";
import { gearQuerySchema, idParamSchema } from "../../middleware/requestSchemas.js";

const router = Router();

// Create Gear (PROVIDER & ADMIN)
router.post(
  "/",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(GearValidation.createGearValidationSchema),
  GearController.createGear,
);

// Get All Gears with filters/search (Public)
router.get("/", validateRequest(gearQuerySchema), GearController.getAllGears);

// Get Single Gear by ID (Public)
router.get("/:id", validateRequest(idParamSchema), GearController.getGearById);

// Update Gear (PROVIDER - Owner only, or ADMIN)
router.patch(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(idParamSchema),
  validateRequest(GearValidation.updateGearValidationSchema),
  GearController.updateGear,
);

// Delete Gear (PROVIDER - Owner only, or ADMIN)
router.delete(
  "/:id",
  auth(UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(idParamSchema),
  GearController.deleteGear,
);

export const GearRoutes = router;
