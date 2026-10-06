import { z } from "zod";

import { RentalStatus } from "../../../generated/prisma/enums";

const createRentalValidationSchema = z.object({
  body: z.object({
    gearId: z.string({
      error: "Gear ID is required",
    }),

    startDate: z.string({
      error: "Start date is required",
    }),

    endDate: z.string({
      error: "End date is required",
    }),
  }),
});

const updateRentalStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(RentalStatus, {
      error: "Status is required",
    }),
  }),
});

export const RentalValidation = {
  createRentalValidationSchema,
  updateRentalStatusValidationSchema,
};
