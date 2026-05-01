import { Request, Response } from "express";
import { NODE_ENV } from "../app.js";

type ErrorDetail = {
  field: string;
  message: string;
  type?: string;
};

type ErrorDetailsObject = {
  code: string;
  error: ErrorDetail[];
};

class ApiError extends Error {
  statusCode: number;
  success: boolean;
  message: string;
  error: ErrorDetailsObject | null;

  constructor(
    message: string,
    statusCode: number,
    success: boolean,
    error = null,
  ) {
    super(message);
    this.statusCode = statusCode || 500;
    this.success = success || false;
    this.message = message || "Something Went Wrong";
    this.error = error;
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        statusCode: err.statusCode,
        message:  NODE_ENV === "production" ? err.message : "Internal Server Error",
        error: NODE_ENV === "production" ? null : err.error 
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      details: null,
    },
  });
};
