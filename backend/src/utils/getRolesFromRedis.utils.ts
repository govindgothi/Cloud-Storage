import { getRedisClient } from "../db/redis.db.js";
import { ApiError } from "./errorHandler.utils.js";

// 1. Helper function to fetch and parse a single key (Removes redundancy)
export const getAndParseKey = async (key: string) => {
  const redis = getRedisClient()
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const getAllRolesFromRedis = async (key:string) => {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(key);
    
    if (keys.length === 0) {
      throw new ApiError("No roles found in Redis", 404, false);
    }

    // Reuse parsing logic
    return await Promise.all(keys.map(key => getAndParseKey(key)));
  } catch (error) {
    // Pass the actual error message or log it so you can debug later!
    throw new ApiError(error instanceof Error ? error.message : "Failed to fetch all roles", 500, false);
  }
};

// Fixed: Now accurately fetches by Name or ID using 'redis.get'
export const getRoleByKeyFromRedis = async (key: string) => {
  try {
    const role = await getAndParseKey(key);

    if (!role) {
      throw new ApiError(`Role not found for key: ${key}`, 404, false);
    }

    return role;
  } catch (error) {
    if (error instanceof ApiError) throw error; // Pass through 404s
    throw new ApiError("Failed to fetch role from Redis", 500, false);
  }
};