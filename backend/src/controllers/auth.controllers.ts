import { NextFunction, Request, Response } from "express";
import {
  sendOtpService,
  userRegisterService,
} from "../services/auth.services.js";
import { successResponse } from "../utils/responseHandler.js";
import { HttpMessage, HttpStatus } from "../constant/globle.js";
import { ApiError } from "../utils/errorHandler.utils.js";

export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const response = await userRegisterService(data);
    if (response?.success) {
      return res
        .status(response.statusCode)
        .json(response);
    }else{
      throw new ApiError(HttpMessage.UNABLE_TO_PROCESS,HttpStatus.INTERNAL_SERVER_ERROR,false)
    }
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payloads = req.body;
    const response = await sendOtpService(payloads);
    if (response.success) {
      return res.status(response.statusCode).json(response);
    } else {
      throw new ApiError(HttpMessage.UNABLE_TO_PROCESS, HttpStatus.INTERNAL_SERVER_ERROR, false, {
        code: "VALIDATION_ERROR",
        error: [],
      });
    }
  } catch (error) {
    next(error);
  }
};
