import { NextFunction, Request, Response } from "express";
import {
  logoutByAdminService,
  logoutFromAllDeviceByAdminService,
  logoutFromAllDeviceService,
  logoutService,
  replaceSessionService,
  sendOtpService,
  userLoginService,
  userRegisterService,
} from "../services/auth.services.js";
import { HttpMessage, HttpStatus } from "../constant/globle.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { isProduction } from "../app.js";
import {
  sessionIdParams,
  userIdParams,
} from "../interface/common.interface.js";
import { success } from "zod";

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
      });
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
    if (!response.success && response.token) {
      const { success, statusCode, data, token, message } = response;
      res.cookie("login-sid", token, {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none", 
        path: "/",
      });
      throw new ApiError(message || "", statusCode, success, null, data);
    }
    if (response.success && response.user) {
      const { token } = response.user;
      res.cookie("sid", token, {
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
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(response.statusCode).json(response);
    }
  } catch (error) {
    next(error);
  }
};

// All Logout Services

// logout by user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, email, sessionId } = req.user;
    const response = await logoutService({ userId, sessionId, email });
    if (response?.success) {
      res.cookie("sid", "", {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(response.statusCode).json(response);
    }
    return res.status(404).json({ success: false, message: "Data Not found" });
  } catch (error) {
    next(error);
  }
};

//user can logout from all device
export const logoutFromAllDevice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
   try {
    const { userId } = req.user;
    const response = await logoutFromAllDeviceService({ userId });
    if (response?.success) {
      res.cookie("sid", "", {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(response.statusCode).json(response);
    }
    return res.status(404).json({ success: false, message: "Data Not found" });
  } catch (error) {
    next(error);
  }
};
// logout by admin
export const logoutByAdmin = async (
  req: Request<sessionIdParams>,
  res: Response,
  next: NextFunction,
) => {
   try {
    const { sessionId } = req.params;
    const response = await logoutByAdminService({ sessionId });
    if (response?.success) {
      res.cookie("sid", "", {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(response.statusCode).json(response);
    }
    return res.status(404).json({ success: false, message: "Data Not found" });
  } catch (error) {
    next(error);
  }
};
// logout from all device by admin
export const logoutFromAllDeviceByAdmin = async (
  req: Request<userIdParams>,
  res: Response,
  next: NextFunction,
) => {
   try {
    const { userId } = req.params;
    const response = await logoutFromAllDeviceByAdminService({ userId });
    if (response?.success) {
      res.cookie("sid", "", {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(response.statusCode).json(response);
    }
    return res.status(404).json({ success: false, message: "Data Not found" });
  } catch (error) {
    next(error);
  }
};


//list of login user for admin
export const listOfAllLoginUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

};
