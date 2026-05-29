import { getRedisClient } from "../db/redis.db.js";
import { customIpRateLimitType } from "../interface/auth.interface.js";
import { ApiError } from "./errorHandler.utils.js";

export const customRateLimit = async ({
  ipKey,
  emailKey,
}: customIpRateLimitType) => {
  try {
    const redis = getRedisClient();

    const [ipCount, emailCount] = await Promise.all([
      redis.incr(ipKey),
      redis.incr(emailKey),
    ]);

    if (ipCount === 1) {
      await redis.expire(ipKey, 600);
    }

    if (emailCount === 1) {
      await redis.expire(emailKey, 600);
    }

    if (ipCount > 10) {
      throw new ApiError("Too many requests from IP", 401, false);
    }

    if (emailCount > 5) {
      throw new ApiError("Too many OTP requests", 401, false);
    }
  } catch (error) {
     throw new ApiError("Some thing went wrong",401,false)
  }
};
