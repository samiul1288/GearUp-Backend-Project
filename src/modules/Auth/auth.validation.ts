import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
      email: z.
          email("Invalid email address")
          .min(1, "Emaill is required"),
      
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z
      .enum([UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN])
      .optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
            .email("Invalid email address")
          .min( 1, "Email is required" ),
    password: z.string("Password is required"),
  }),
});

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
};
