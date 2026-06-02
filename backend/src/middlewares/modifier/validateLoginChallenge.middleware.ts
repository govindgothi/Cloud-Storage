import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/errorHandler.utils.js";
import { decodeToken } from "../../utils/jwtToken.utils.js";
import { getRedisClient } from "../../db/redis.db.js";

export const validateChallengeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    // Authorization: Bearer xxx
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    // Fallback to signed cookie
    if (!token) {
      token = req.signedCookies["login-sid"];
    }
    if (!token) {
      throw  new ApiError("Authentication token is required",401,false)
    }

    const decoded = decodeToken<{email:string,userId:number}>(token);
    if (!decoded?.userId) {
     throw new  ApiError("Invalid token",401,false)
    }

    const { userId } = decoded;

    const client = getRedisClient();

    const storedToken = await client.get(
      `login_challenge:${userId}`
    );

    if (!storedToken) {
      throw new ApiError("Session expired or not found",401,false)
    }

    if (storedToken !== token) {
      throw new  ApiError("Invalid session",401,false)
    }

    req.user = decoded;

    next();
  } catch (error) {
    next(error)
  }
};