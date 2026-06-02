import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/errorHandler.utils.js";
import { decodeToken } from "../../utils/jwtToken.utils.js";
import { getRedisClient } from "../../db/redis.db.js";


const guestOnlyRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
];

export const validateAuthSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    let token: string | undefined;

    // Authorization: Bearer <token>
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback to signed cookie
    if (!token) {
      token = req.signedCookies?.sid;
    }

    if (!token) {
      throw new ApiError("Authentication token is required", 401, false);
    }

    const decoded = decodeToken<{
      userId: number;
      email: string;
      sessionId: string;
    }>(token);

    if (!decoded?.userId || !decoded?.sessionId) {
      throw new ApiError("Invalid token", 401, false);
    }

    const client = getRedisClient();

    const session = await client.sendCommand([
      "JSON.GET",
      `user:session:${decoded.sessionId}`,
    ]);

    if (!session) {
      throw new ApiError(
        "Session expired or logged out",
        401,
        false
      );
    }

    req.user = decoded;

    if (guestOnlyRoutes.includes(req.path)) {
      throw new ApiError(
        "You are already logged in",
        409,
        false
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};