import { email } from "zod";
import { registerQuery } from "../models/auth.models.js";
import { getUsersDetailByEmail } from "../models/common.models.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { getProfileUrl } from "../utils/getProfileUrl.utils.js";
import { UserRegisterInput } from "../validations/auth.validations.js";
import { generateSixDigitCode } from "../utils/common.utils.js";
import { getRedisClient } from "../db/redis.db.js";
import { error } from "console";
import { successResponse } from "../utils/responseHandler.js";

export const userRegisterService = async (data: UserRegisterInput) => {
  const { username, email, password, otp } = data;
  const profileUrl = getProfileUrl(username);
  console.log(profileUrl);
  const fields = ["id", "email"];
  const isUser = await getUsersDetailByEmail({ fields, email });
  console.log("isUser", isUser);
  if (isUser && isUser.length) {
    throw new ApiError("This Email is already exists", 403, false);
  }
  const userStore = await registerQuery(username, email, password, profileUrl);
  if (userStore.affectedRow == 1 && userStore.insertedId) {
    return successResponse({id: userStore.insertedId},"User successfuly register",201)
  }
};

export const sendOtpService = async ({
  email,
  clientIp,
}: {
  email: string;
  clientIp: string;
}) => {
  const redis = getRedisClient();

  // keys for otp redis storage
  const ipLimitKey = `otp:ip:${clientIp}`;
  const emailLimitKey = `otp:email:${email}`;

  const blockedIpKey = `otp:block:${clientIp}:${Math.random()}`;
  const blockedEmailKey = `otp:block:${email}`;

  const otpDataKey = `otp:data:${email}`;

  // check if any otp exists on give mail
  const existingData = await redis.get(otpDataKey);
  console.log(existingData, "existing data");
  if (existingData) {
    const ttl = await redis.ttl(otpDataKey);

    throw new ApiError(`Try again in ${ttl} seconds`, 429, false);
  }
  
  // check, Is given ip block or not
  const isIpBlocked = await redis.get(blockedIpKey);

  if (isIpBlocked) {
    const ttl = await redis.ttl(blockedIpKey);
    throw new ApiError(
      `Too many requests. Try again in ${ttl} seconds`,
      429,
      false,
    );
  }
  // check, Is given email block or not
  const isEmailBlocked = await redis.get(blockedEmailKey);
  if (isEmailBlocked) {
    const ttl = await redis.ttl(blockedEmailKey);
    throw new ApiError(
      `Too many requests. Try again in ${ttl} seconds`,
      429,
      false,
    );
  }

  // checking request count ip for bloacking and increase count of ip
  const requestCountIp = await redis.incr(ipLimitKey);
  if (requestCountIp === 1) {
    await redis.expire(ipLimitKey, 900); // 15 mins
  }

  //  checking request count email for bloacking and increase count of email
  const requestCountEmail = await redis.incr(emailLimitKey);
  if (requestCountEmail === 1) {
    await redis.expire(emailLimitKey, 900); // 15 mins
  }

  // set block limit 30 minute whose send request of 5 otp with in 15 min this email
  if (requestCountEmail > 5) {
    await redis.set(blockedEmailKey, "1", {
      EX: 1800, // 30 mins
    });
    const ttl = await redis.ttl(blockedEmailKey);
    // --add email and ip in queue for store in backend sql db
    throw new ApiError(
      `Too many requests on Email. Try again in ${ttl} seconds`,
      429,
      false,
    );
  }

  // set block limit 30 minute whose send request of 5 otp with in 15 min on this ip
  if (requestCountIp > 7) {
    await redis.set(blockedIpKey, "1", {
      EX: 1800, // 30 mins
    });
    const ttl = await redis.ttl(blockedIpKey);
    // --add ip and email in queue for store in backend sql db
    throw new ApiError(
      `Too many requests on Ip. Try again in ${ttl} seconds`,
      429,
      false,
    );
  }

  const otpCode = generateSixDigitCode();
  const payload = {
    email,
    clientIp,
    otpCode,
    attempt: 0,
  };

  // Store JSON string with expiry 
  await redis.set(otpDataKey, JSON.stringify(payload), {
    EX: 120, // 2 minutes
  });

  // Send Otp on email

  return successResponse(payload,"Otp send successfuly",201)
};
