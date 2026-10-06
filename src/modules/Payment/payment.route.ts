import { Router } from "express";

import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = Router();

// Pay for a Rental - Customer only
router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPayment,
);

// Get My / Related Payments
router.get(
  "/",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  PaymentController.getPayments,
);

// Update Payment Status - Admin only
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(PaymentValidation.updatePaymentStatusValidationSchema),
  PaymentController.updatePaymentStatus,
);

export const PaymentRoutes = router;
