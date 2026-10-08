import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    gearId: z.uuid("Gear ID must be a valid UUID"),

    rentalId: z.uuid("Rental ID must be a valid UUID"),

    rating: z
      .number({
        error: "Rating is required",
      })
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),

    comment: z.string({
      error: "Comment is required",
    }),
  }).strict(),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z
      .number({
        error: "Rating must be a number",
      })
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5")
      .optional(),

    comment: z.string().optional(),
  }).strict(),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
