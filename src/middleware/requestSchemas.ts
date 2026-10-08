import { z } from "zod";

const paramsWithId = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const idParamSchema = paramsWithId;

export const gearIdParamSchema = z.object({
  params: z.object({
    gearId: z.uuid(),
  }),
});

export const gearQuerySchema = z.object({
  query: z.object({
    searchTerm: z.string().trim().max(100).optional(),
    categoryId: z.uuid().optional(),
    location: z.string().trim().max(100).optional(),
    brand: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().finite().nonnegative().optional(),
    maxPrice: z.coerce.number().finite().nonnegative().optional(),
    isAvailable: z.enum(["true", "false"]).optional(),
  }).refine(
    ({ minPrice, maxPrice }) =>
      minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
    { message: "minPrice cannot be greater than maxPrice" },
  ),
});
