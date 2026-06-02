import z from "zod";
import { emailSchema, otpSchema, passwordSchema, urlSchema, usernameSchema } from "./common/common.validations.js";

export const userRegisterSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  otp: otpSchema,
})
.refine((data) => data.password  === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;

export const LoginUserSchema = z.object({
  email:emailSchema,
  password: passwordSchema
})

export type LoginUserInput = z.infer<typeof LoginUserSchema>