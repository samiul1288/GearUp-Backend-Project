import { z } from "zod";

import { RentalStatus } from "../../../generated/prisma/enums.js";

const createRentalValidationSchema = z.object({
  body: z.object({
    gearId: z.uuid("Gear ID must be a valid UUID"),

    startDate: z.string({
      error: "Start date is required",
    }).refine((value) => !Number.isNaN(Date.parse(value)), "Invalid start date"),

    endDate: z.string({
      error: "End date is required",
    }).refine((value) => !Number.isNaN(Date.parse(value)), "Invalid end date"),
  }).strict(),
});

const updateRentalStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(RentalStatus, {
      error: "Status is required",
    }),
  }).strict(),
});

export const RentalValidation = {
  createRentalValidationSchema,
  updateRentalStatusValidationSchema,
};
