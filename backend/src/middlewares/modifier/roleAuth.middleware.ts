import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/errorHandler.utils.js";
import { getRedisClient } from "../../db/redis.db.js";
import { redisRolesKey } from "../../constant/redisKey.js";
import { getAndParseKey } from "../../utils/getRolesFromRedis.utils.js";

/**
 * Middleware to restrict route access based on user roles.
 * @param {...string} allowedRoles - The roles permitted to access the route.
 */
export const authorizeRoles = (...allowedRoles:string[]) => {
  return async(req:Request, res:Response, next:NextFunction) => {
    const redis = getRedisClient()
    // 1. Ensure the user exists on the request object 
    // (This assumes your authentication/JWT middleware runs BEFORE this)
    if (!req.user) {
     throw new ApiError("Unauthorized: User authentication required.",401,false)
    }

    // 2. Extract the user's role
    const userId= req.user.roleId;
    const key = redisRolesKey.redisRoleId(userId)
    const getUserRole = await getAndParseKey(key)
    // 3. Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(getUserRole.role)) {
      return res.status(403).json({ 
        status: 'fail',
        message: `Forbidden: You do not have permission to access this resource. Required role: [${allowedRoles.join(' or ')}]` 
      });
    }

    // 4. User is authorized! Pass control to the next middleware/controller
    next();
  };
};

