import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/errorHandler.utils.js";
import { decodeToken } from "../../utils/jwtToken.utils.js";
import { getRedisClient } from "../../db/redis.db.js";

const routeOtpTypeMap: Record<string, string>  = {
  "/register": "register",
  "/forget-password": "forgetPassword",
};

export const validateOtpSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("req.headers",req.headers)
    let token: string | undefined;

    // Authorization: Bearer <token>
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback to signed cookie
    if (!token) {
      token = req.signedCookies["otp-sid"];
    }
     console.log(token)
    if (!token) {
      throw new ApiError("Session token is required", 401, false);
    }

    const decoded = decodeToken<{
      email: string;
      clientIp: string;
      otpType: string;
    }>(token);

    if (!decoded?.email) {
      throw new ApiError("Otp session is expire", 401, false);
    }

    const expectedOtpType = routeOtpTypeMap[req.path];

    if (!expectedOtpType) {
      return res.status(403).json({
        message: "Invalid OTP route",
      });
    }

    if (decoded.otpType !== expectedOtpType) {
      return res.status(403).json({
        message: "OTP type mismatch",
      });
    }

    const client = getRedisClient();
    const getSessionToken = await client.get(`otp:session:${decoded?.email}`);

    if (getSessionToken !== token) {
      throw new ApiError(
        "Otp session is expire or may be you change your device",
        401,
        false,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
