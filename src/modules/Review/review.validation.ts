import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    gearId: z.string({
      error: "Gear ID is required",
    }),

    rentalId: z.string({
      error: "Rental ID is required",
    }),

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
  }),
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
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
