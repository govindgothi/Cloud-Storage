import { ZodError } from "zod";

export const formatZodError = (error: ZodError) => {
  const formatted: Record<string, string> = {};

  error.issues.forEach((err) => {
    const field = err.path.join(".");

    // only take first error per field
    if (!formatted[field]) {
      formatted[field] = err.message
    }
  });

  return {
    success: false,
    errors: formatted,
  };
};