import { z } from "zod";

const createPaymentValidationSchema = z.object({
  body: z.object({
    rentalId: z.uuid("A valid rental ID is required"),
  }).strict(),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
};
