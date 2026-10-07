import { z } from "zod";

import { PaymentStatus } from "../../../generated/prisma/enums.js";

const createPaymentValidationSchema = z.object({
  body: z.object({
    rentalId: z.string().min(1, "Rental ID is required"),

    transactionId: z.string().optional(),
  }),
});

const updatePaymentStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(PaymentStatus, {
      error: "Payment status is required",
    }),

    transactionId: z.string().optional(),
  }),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  updatePaymentStatusValidationSchema,
};
