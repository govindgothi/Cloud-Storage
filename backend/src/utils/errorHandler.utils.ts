import { NextFunction, Request, Response } from "express";

const NODE_ENV = process.env.NODE_ENV

type ErrorDetail = {
  field: string;
  message: string;
  type?: string;
};

type ErrorDetailsObject = {
  code: string;
  error: ErrorDetail[];
};

export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  message: string;
  error: ErrorDetailsObject | null;
  data: any

  constructor(
    message: string,
    statusCode: number,
    success: boolean,
    error: ErrorDetailsObject | null= null,
    data:any = []
  ) {
    super(message);
    this.statusCode = statusCode || 500;
    this.success = success || false;
    this.message = message || "Something Went Wrong";
    this.error = error;
    this.data = data
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("errr-->", err);
  if (err instanceof ApiError) {
    console.log("errr-->", err);
    return res.status(err.statusCode).json({
      success: false,
      error: {
        statusCode: err.statusCode,
        message:
        NODE_ENV != "production" ? err.message : "Internal server error",
        error: NODE_ENV != "production" ? err.error : null,
      },
      data:err.data
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: NODE_ENV !== "production" ? err.message : "Something went wrong",
      details: null,
    },
  });
};
