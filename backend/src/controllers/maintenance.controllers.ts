import { Request, Response } from "express";
import { query } from "../db/postgresSql.js";
import { getRedisClient } from "../db/redis.db.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { getAllRolesFromRedis } from "../utils/getRolesFromRedis.utils.js";
import { getAllRoles } from "../models/common.models.js";
import { redisRolesKey } from "../constant/redisKey.js";

/**
 * Sync all active roles from PostgreSQL to Redis.
 *
 * Redis Key Format:
 * role:user
 * role:superAdmin
 * role:teacher
 *
 * Redis Value:
 * {
 *   id: "...",
 *   role: "user",
 *   display_role: "User"
 * }
 */
export const syncRolesToRedis = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get Redis client instance
    const redis = getRedisClient();

    // Fetch all non-deleted roles from PostgreSQL
    const result = await getAllRoles()

    // Throw error if no roles exist
    if (result.length === 0) {
      throw new ApiError("No roles found", 404, false);
    }

    // Store each role in Redis using role name as part of the key
    await Promise.all(
      result.map((role: any) =>
        redis.set(
          `${redisRolesKey.redisRoleName(role.role)}`,
          JSON.stringify({
            roleId: role.id,
            role: role.role,
            display_role: role.display_role,
          }),
        ),
      ),
    );
    await Promise.all(
      result.map((role: any) =>
        redis.set(
          `${redisRolesKey.redisRoleId(role.id)}`,
          JSON.stringify({
            roleId: role.id,
            role: role.role,
            display_role: role.display_role,
          }),
        ),
      ),
    );

    // Return success response
    res.status(200).json({
      success: true,
      count: result.length,
      message: "Roles synced to Redis",
      result,
    });
  } catch (error) {
    throw new ApiError(
      "Failed to sync roles to Redis",
      500,
      false,
    );
  }
};

/**
 * Retrieve all roles stored in Redis.
 *
 * Reads all keys matching:
 * role:*
 *
 * Example:
 * role:user
 * role:teacher
 * role:employee
 */
export const getRolesStoredInRedis = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get all roles from  redis
    const key = redisRolesKey.redisRoleName('*')

    const roles = await getAllRolesFromRedis(key)

    // Return all roles stored in Redis
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles.filter(Boolean),
    });
  } catch (error) {
    console.error(error);

    throw new ApiError(
      "Something went wrong",
      500,
      false,
    );
  }
}; 