import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  });
  redisClient.on('connect', () => {
    console.log('Redis connecting...');
  });
  redisClient.on('ready', () => {
    console.log('Redis connected');
  });
  redisClient.on('error', (err: Error) => {
    console.error('Redis error:', err);
  });
  redisClient.on('end', () => {
    console.log('Redis connection closed');
  });
  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client is not connected');
  }
  return redisClient;
};