import { Router } from "express";
import { CategoryController } from "./category.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import  validateRequest  from "../../middleware/validateRequest.js";
import { CategoryValidation } from "./category.validation.js";
import { idParamSchema } from "../../middleware/requestSchemas.js";

const router = Router();

// Create Category (Admin Only)
router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory,
);

// Get All Categories (Public)
router.get("/", CategoryController.getAllCategories);

// Get Single Category By ID (Public)
router.get("/:id", validateRequest(idParamSchema), CategoryController.getCategoryById);

// Update Category (Admin Only)
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(idParamSchema),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory,
);

// Delete Category (Admin Only)
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(idParamSchema),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;
