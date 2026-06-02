import { NextFunction, Request, Response } from "express";
import {
  replaceSessionService,
  sendOtpService,
  userLoginService,
  userRegisterService,
} from "../services/auth.services.js";
import { HttpMessage, HttpStatus } from "../constant/globle.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { isProduction } from "../app.js";
import { sessionIdParams, userIdParams } from "../interface/common.interface.js";

export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const response = await userRegisterService(data);
    if (response?.success) {
      return res.status(response.statusCode).json(response);
    } else {
      throw new ApiError(
        HttpMessage.UNABLE_TO_PROCESS,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
      );
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
      res.cookie("otp-sid", response.data.token, {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        // sameSite: isProduction ? "none" : "lax",
      })
      return res.status(response.statusCode).json(response);
    } else {
      throw new ApiError(
        HttpMessage.UNABLE_TO_PROCESS,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        {
          code: "VALIDATION_ERROR",
          error: [],
        },
      );
    }
  } catch (error) {
    next(error);
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const response = await userLoginService(data);
    if(!response.success){
      const {success,statusCode,data,token,message} = response
      res.cookie("login-sid", token, {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
     throw new ApiError(message || "",statusCode,success,null,data)
    }
    if (response.success) {
      res.cookie("sid", response, {
         signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(response.statusCode).json(response);
    }
    res.json(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const replaceSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.userId;
    const clientIp = req.clientIp;
    if (!userId || userId == null) {
      throw new ApiError("UserId is not found", 404, false);
    }
    const { sessionId } = req.body;
    const response = await replaceSessionService({
      sessionId,
      userId,
      clientIp,
    });
    if (response.success) {
      res.cookie("sid", response.data.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });
      return res.status(response.statusCode).json(response);
    }
  } catch (error) {
    next(error)
  }
};


// All Logout Services    
export const logoutService = async ({sessionId}:sessionIdParams)=>{

}

export const logoutFromAllDeviceService = async({userId}:userIdParams)=>{

}

export const logoutByAdminService = async({sessionId}:sessionIdParams)=>{

}

export const logoutFromAllDeviceByAdminService = async ({userId}:userIdParams)=>{

}

export const listOfAllLoginUsersService = async ()=>{

}
