import { Router } from "express";

import { PaymentController } from "./payment.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import validateRequest from "../../middleware/validateRequest.js";
import { PaymentValidation } from "./payment.validation.js";
import { idParamSchema } from "../../middleware/requestSchemas.js";

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

router.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(idParamSchema),
  PaymentController.getPaymentById,
);

router.post("/sslcommerz/success", PaymentController.completeSslCommerzPayment);
router.post("/sslcommerz/ipn", PaymentController.completeSslCommerzPayment);
router.post("/sslcommerz/fail", PaymentController.failSslCommerzPayment);
router.post("/sslcommerz/cancel", PaymentController.failSslCommerzPayment);

router.get("/sslcommerz/success", PaymentController.completeSslCommerzPayment);
router.get("/sslcommerz/ipn", PaymentController.completeSslCommerzPayment);
router.get("/sslcommerz/fail", PaymentController.failSslCommerzPayment);
router.get("/sslcommerz/cancel", PaymentController.failSslCommerzPayment);

export const PaymentRoutes = router;
