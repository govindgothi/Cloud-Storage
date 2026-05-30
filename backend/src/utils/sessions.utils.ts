import { getRedisClient } from "../db/redis.db.js";
import { createSessionType } from "../interface/auth.interface.js";
import {
  sessionIdParams,
  userIdParams,
} from "../interface/common.interface.js";
import { generateRandomUUId } from "./common.utils.js";
import { ApiError } from "./errorHandler.utils.js";

export const createSession = async ({
  userId,
  email,
  clientIp,
}: createSessionType) => {
  const client = getRedisClient();
  // session object
  const session = {
    userId: userId,
    email: email,
    clientIp: clientIp,
  };
  const sessionId = generateRandomUUId();

  // store JSON session
  const sessionResult = await client.sendCommand([
    "JSON.SET",
    `user:session:${sessionId}`,
    "$",
    JSON.stringify(session),
  ]);

  const sessionResult1 = await client.sAdd(
    `user:sessions:userId:${session.userId}`,
    sessionId,
  );
  return sessionResult1;
};

export const getCountOfSession = async ({ userId }: userIdParams) => {
  const client = getRedisClient();
  const count = await client.sCard(`user:sessions:userId:${userId}`);
  return count
};

export const deleteSessionBySessionId = async ({
  sessionId,
}: sessionIdParams) => {
  const client = getRedisClient();
  const session = await client.sendCommand([
    "JSON.GET",
    `user:session:${sessionId}`,
  ]);
  if (session == null || typeof session !== "string") {
    throw new ApiError("session not found", 404, false);
  }

  const sessionData = JSON.parse(session);

  await client.del(`user:session:${sessionId}`);
  await client.sRem(`user:sessions:userId:${sessionData.userId}`, sessionId);
};

export const getUserSessions = async({userId}:userIdParams)=> {
  const client = getRedisClient();
  const sessionIds:string[] = await client.sMembers(
    `user:sessions:userId:${userId}`
  );

  if (!sessionIds.length) {
    throw new ApiError("",404,false)
  };

  const sessions = await Promise.all(
    sessionIds.map(id =>
      client.sendCommand([
        "JSON.GET",
        `user:session:${id}`,
      ])
    )
  );

  const sessionsList = sessions
    .filter(Boolean).filter((session) => typeof session === "string")
    .map(session => JSON.parse(session));
  return {
    sessionsList,
    sessionIds 
  }
}

export const deleteAllSessionByUserId = async ({ userId }: userIdParams) => {
  const client = getRedisClient();

  const { sessionIds } = await getUserSessions({ userId });

  if (!sessionIds.length) {
    throw new  ApiError("sessions not found",404,false)
  }

  await Promise.all(
    sessionIds.map(async (sessionId:string) => {
      await client.del(`user:session:${sessionId}`);
      await client.sRem(
        `user:sessions:userId:${userId}`,
        sessionId
      );
    })
  );

  // Optional: remove the empty set itself
  await client.del(`user:sessions:userId:${userId}`);
};
