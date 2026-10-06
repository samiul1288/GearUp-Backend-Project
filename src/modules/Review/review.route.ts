import { Router } from "express";
import { ReviewController } from "./review.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import  validateRequest  from "../../middleware/validateRequest";
import { ReviewValidation } from "./review.validation";

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
