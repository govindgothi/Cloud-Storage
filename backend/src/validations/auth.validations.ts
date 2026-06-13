import z from "zod";
import {
  emailSchema,
  otpSchema,
  passwordSchema,
  roleId,
  urlSchema,
  usernameSchema,
} from "./common/common.validations.js";

/**
 * {Object} SendOtpSchemaInput
 * @description Validation schema for otp send requests.
 */
export const sendOtpSchema = z.object({
  email: emailSchema,
  purpose: z.enum(["register", "forget-password", "reset-password", "login"], {
    message: "Invalid purpose.",
  }),
});

export type SendOtpSchemaInput = z.infer<typeof sendOtpSchema>;


/**
 * {Object} UserRegisterInput
 * @description Validation schema for user registration requests.
 * Ensures all required fields are present, properly formatted, and passwords match.
 */
export const userRegisterSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    roleId:roleId,
    otp: otpSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;

/**
 * {Object} LoginUserInput
 * @description Validation schema for user login requests.
 * */
export const LoginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;
