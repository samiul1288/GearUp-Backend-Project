import { z } from "zod";
import { UserStatus } from "../../../generated/prisma/enums.js";

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().url("Avatar must be a valid URL").optional(),
  }).strict(),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(UserStatus),
  }).strict(),
});

export const UserValidation = {
  updateProfileValidationSchema,
  updateUserStatusValidationSchema,
};
