import { getRedisClient } from "../db/redis.db.js";
import { createSessionType } from "../interface/auth.interface.js";
import {
  sessionIdParams,
  userIdParams,
} from "../interface/common.interface.js";
import { generateRandomUUId } from "./common.utils.js";
import { ApiError } from "./errorHandler.utils.js";
import { createToken, decodeToken } from "./jwtToken.utils.js";

export const loginChallengeSession = async ({
  userId,
  email,
  clientIp,
  roleId // no need in this 
}: createSessionType) => {
  const client = getRedisClient();
  const session = {
    userId: userId,
    email: email,
    // clientIp: clientIp,
    roleId,
  };
  const token = createToken(session, "3m");
  await client.set(`login_challenge:${userId}`, token, { EX: 180 });
  return token;
};

export const getLoginChallengeUserData = async ({ userId }: userIdParams) => {
  const client = getRedisClient();

  const token = await client.get(`login_challenge:${Number(userId)}`);
  console.log("token",token)
  if (!token) {
    throw new ApiError("Time limit expiry re-login again", 400, false);
  }
  const isData: createSessionType = decodeToken(token);
  return isData;
};

export const createSession = async ({
  userId,
  email,
  clientIp,
  roleId
}: createSessionType) => {
  const client = getRedisClient();
  // session object
  const sessionId = generateRandomUUId();
  const session = {
    userId: userId,
    email: email,
    clientIp: clientIp,
    roleId
  };
  // store JSON session
  const sessionResult = await client.sendCommand([
    "JSON.SET",
    `user:session:${sessionId}`,
    "$",
    JSON.stringify(session),
  ]);
  await client.expire(`user:session:${sessionId}`, 60 * 60 * 24 * 7);

  const sessionResult1 = await client.sAdd(
    `user:sessions:userId:${session.userId}`,
    sessionId,
  );
  await client.expire(
    `user:sessions:userId:${session.userId}`,
    60 * 60 * 24 * 30,
  );
  const token = createToken({ ...session, sessionId }, "7d");
  if (!token) {
    throw new ApiError("Error while creating session", 400, false);
  }
  return token;
};

export const getCountOfSession = async ({ userId }: userIdParams) => {
  const client = getRedisClient();
  const count = await client.sCard(`user:sessions:userId:${userId}`);
  return count;
};

export const deleteSessionBySessionId = async ({
  sessionId,
}: sessionIdParams) => {
  const client = getRedisClient();
  console.log("sessionId",sessionId)
  const session = await client.sendCommand([
    "JSON.GET",
    `user:session:${sessionId}`,
  ]);
  console.log("session",session)
  if (session == null || typeof session !== "string") {
    throw new ApiError("session not found", 404, false);
  }

  const sessionData = JSON.parse(session);

  const deletedSession = await client.del(`user:session:${sessionId}`);
  const removedFromSet = await client.sRem(
    `user:sessions:userId:${sessionData.userId}`,
    sessionId,
  );
  if (deletedSession !== 1 && removedFromSet !== 1) {
    throw new ApiError(
      "Your session is not founrd or Your arleady logout",
      200,
      false,
    );
  }
  return true;
};

export const getUserSessions = async ({ userId }: userIdParams) => {
  const client = getRedisClient();

  const sessionIds: string[] = await client.sMembers(
    `user:sessions:userId:${userId}`,
  );

  if (!sessionIds.length) {
    return {
      sessionIds,
      sessionsList: [],
    };
  }

  const sessions = await Promise.all(
    sessionIds.map((id) =>
      client.sendCommand(["JSON.GET", `user:session:${id}`]),
    ),
  );

  const sessionsList = sessions
    .map((session, index) => {
      if (!session || typeof session !== "string") return null;

      return {
        sessionId: sessionIds[index],
        ...JSON.parse(session),
      };
    })
    .filter(Boolean);

  return {
    sessionIds,
    sessionsList,
  };
};

export const deleteAllSessionByUserId = async ({ userId }: userIdParams) => {
  const client = getRedisClient();

  const { sessionIds } = await getUserSessions({ userId });

  if (!sessionIds.length) {
    throw new ApiError("sessions not found", 404, false);
  }

  sessionIds.map(async (sessionId: string) => {
    await client.del(`user:session:${sessionId}`);
  });

  // Optional: remove the empty set itself
  const deleted = await client.del(`user:sessions:userId:${userId}`);
  if (deleted == 1) return true;
  return false;
};

export const deleteOldesSession = async ({ userId }: userIdParams) => {
  const client = getRedisClient();

  const { sessionsList } = await getUserSessions({ userId });

  if (!sessionsList.length) {
    throw new ApiError("Session not found", 404, false);
  }

  const oldestSession = sessionsList.reduce((oldest, current) => {
    return new Date(current.createdAt).getTime() <
      new Date(oldest.createdAt).getTime()
      ? current
      : oldest;
  });

  const sessionId = oldestSession.sessionId;

  await client.del(`user:session:${sessionId}`);

  await client.sRem(`user:sessions:userId:${userId}`, sessionId);

  return oldestSession;
};
