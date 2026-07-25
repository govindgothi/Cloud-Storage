import z from "zod";
import {
  emailSchema,
  otpSchema,
  passwordSchema,
  roleId,
  usernameSchema,
} from "./common/common.validations.js";
import { AuthMessages } from "../constant/message.constant.js";

/**
 * {Object} SendOtpSchemaInput
 * @description Validation schema for otp send requests.
 */

export const sendOtpSchema = z.object({
  email: emailSchema,
  purpose: z.enum(["register", "forget-password", "reset-password", "login"], {
    message: `${AuthMessages.INVALID_OTP_TYPE}`,
  }),
});

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

/**
 * {Object} LoginUserInput
 * @description Validation schema for user login requests.
 * */
export const LoginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;
