import { z } from "zod";

const createGearValidationSchema = z.object({
  body: z.object({
    title: z
      .string( "Title is required",
      )
      .min(3, "Title must be at least 3 characters"),
    description: z.string(
       "Description is required"
    ),
    pricePerDay: z
      .number(
         "Price per day is required",
      )
      .positive("Price must be greater than 0"),
    location: z.string(
       "Location is required",
    ),
    images: z.array(z.string().url("Invalid image URL")).optional(),
    categoryId: z.string(
      "Category ID is required",
    ),
  }),
});

const updateGearValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    pricePerDay: z.number().positive().optional(),
    location: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    categoryId: z.string().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const GearValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
};
