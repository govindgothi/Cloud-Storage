import { ZodError } from "zod";

export const formatZodError = (error: ZodError) => {
  const formatted: Record<string, string> = {};

  error.issues.forEach((err) => {
    const field = err.path.join(".");

    // only take first error per field
    if (!formatted[field]) {
      console.log(field);
      if (
        err.code === "invalid_type" &&
        err.message.includes("received undefined")
      ) {
        formatted[field] = `${field} is required`;
      } else {
        formatted[field] = err.message;
      }
    }
  });

  return {
    success: false,
    errors: formatted,
  };
};