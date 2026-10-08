import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["CUSTOMER", "PROVIDER"]).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).strict(),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }).strict(),
});

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
};
