import { z } from "zod";

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase() // 1. Normalizes casing so "User@Email.com" becomes "user@email.com"
  .email("Invalid email format")
  .max(255, "Email is too long"); // 2. Prevents excessively long inputs / DB issues
  
// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
    "Password must include uppercase, lowercase, number, and special character"
  );

// OTP validation (assuming 6-digit numeric OTP)
export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d+$/, "OTP must contain only numbers");

export const usernameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name too long");

export const urlSchema = z
  .string()
  .url("Invalid profile URL")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "URL must start with http or https"
  );

export const roleId = z
  .number()
  .int("Role ID must be an integer")
  .positive("Role ID must be positive");

export const parentId= z.number().int().nullable();