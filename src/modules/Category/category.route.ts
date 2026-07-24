import { Router } from "express";
import { CategoryController } from "./category.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import  validateRequest  from "../../middleware/validateRequest";
import { CategoryValidation } from "./category.validation";

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
router.get("/:id", CategoryController.getCategoryById);

// Update Category (Admin Only)
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory,
);

// Delete Category (Admin Only)
router.delete("/:id", auth(UserRole.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
