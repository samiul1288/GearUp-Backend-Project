import { Router } from "express";
import { ReviewController } from "./review.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import  validateRequest  from "../../middleware/validateRequest.js";
import { ReviewValidation } from "./review.validation.js";

const router = Router();

// Create Review (Customer only)
router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

// Get Reviews for a Specific Gear (Public)
router.get("/gear/:gearId", ReviewController.getGearReviews);

// Update Review (Customer only)
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview,
);

// Delete Review (Customer - owner, or ADMIN)
router.delete(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
