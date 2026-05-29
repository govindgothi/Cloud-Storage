import {
  getBlockedEmails,
  getBlockedIps,
  insertBlockedEmail,
  insertBlockedIp,
  registerQuery,
} from "../models/auth.models.js";
import { getUsersDetailByEmail } from "../models/common.models.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { getProfileUrl } from "../utils/getProfileUrl.utils.js";
import { UserRegisterInput } from "../validations/auth.validations.js";
import { generateSixDigitCode } from "../utils/common.utils.js";
import { getRedisClient } from "../db/redis.db.js";
import { successResponse } from "../utils/responseHandler.js";
import { addOtpLogProducer, updateEmailBlockStatusProducer, updateIpBlockStatusProducer } from "../producers/otpLogs.producers.js";
import { hashValue, verifyHash } from "../utils/bcrypt.utils.js";
import { forgetPasswordServiceType, userloginServiceType } from "../interface/auth.interface.js";

export const userRegisterService = async (data: UserRegisterInput) => {
  const redis = getRedisClient()
  const { username, email, password, otp } = data;
  const profileUrl = getProfileUrl(username);
  const fields = ["id", "email"];

  const isUser = await getUsersDetailByEmail({ fields, email });
  console.log("isUser", isUser);
  if (isUser && isUser.length) {
    throw new ApiError("This Email is already exists", 403, false);
  }
   const otpDataKey = `otp:data:${email}`;
   const otpData = await redis.get(otpDataKey);
   if(!otpData || otpData == null){
    throw new ApiError("Otp is expired",401,false)
   }
  const parsedOtp = JSON.parse(otpData)
  const isOtpMatched = await verifyHash(otp,parsedOtp.otp)
  if(isOtpMatched == false || !isOtpMatched){
    
    throw new ApiError("otp is not matched",401,false)
  }
  const hashPassword =  await hashValue(password)
  const userStore = await registerQuery({
    username,
    email,
    password:hashPassword,
    profileUrl,
  });
  if (userStore.affectedRow == 1 && userStore.insertedId) {
    return successResponse(
      { id: userStore.insertedId },
      "User successfuly register",
      201,
    );
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

  const redisBlockedIpKey = `otp:block:${clientIp}`;
  const redisBlockedEmailKey = `otp:block:${email}`;

  const otpDataKey = `otp:data:${email}`;

  // check if any otp exists on give mail
  const existingData = await redis.get(otpDataKey);

  if (existingData) {
    const ttl = await redis.ttl(otpDataKey);
    throw new ApiError(`Try again in ${ttl} seconds`, 429, false);
  }

  // check, Is given ip block or not
  const isIpBlocked = await redis.get(redisBlockedIpKey);

  if (isIpBlocked) {
    const ttl = await redis.ttl(redisBlockedIpKey);
    throw new ApiError(`Too many requests. Try again in ${ttl} seconds`, 429, false,);
  }

  // check, Is given email block or not
  const isEmailBlocked = await redis.get(redisBlockedEmailKey);
  if (isEmailBlocked) {
    const ttl = await redis.ttl(redisBlockedEmailKey);
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
    await redis.set(redisBlockedEmailKey, "1", {
      EX: 1800, // 30 mins
    });
    const ttl = await redis.ttl(redisBlockedEmailKey);
    // --add email and ip in queue for store in backend sql db
    updateEmailBlockStatusProducer({email,redisBlockedEmailKey})
    throw new ApiError(
      `Too many requests on Email. Try again in ${ttl} seconds`,
      429,
      false,
    );
    
  }

  // set block limit 30 minute whose send request of 5 otp with in 15 min on this ip
  if (requestCountIp > 7) {
    await redis.set(redisBlockedIpKey, "1", {
      EX: 1800, // 30 mins
    });
    const ttl = await redis.ttl(redisBlockedIpKey);
    // --add ip and email in queue for store in backend sql db
    updateIpBlockStatusProducer({ip:clientIp,redisBlockedIpKey})
    throw new ApiError(
      `Too many requests on Ip. Try again in ${ttl} seconds`,
      429,
      false,
    );
   
  }

  const [blockedIps, blockedEmails] = await Promise.all([
    getBlockedIps({ ip: clientIp }),
    getBlockedEmails({ email }),
  ]);
  console.log(blockedIps,blockedEmails)
  
  let ipId: number = blockedIps[0].id
  let emailId: number = blockedEmails[0].id


  if (!(blockedIps.length>0)) {
    const ipdata = await insertBlockedIp({ ip: clientIp });
    ipId = ipdata.insertedId;
  }
  if (!(blockedEmails.length>0)) {
    const emaildata = await insertBlockedEmail({ email });
    emailId = emaildata.insertedId;
  }

  const otpCode = generateSixDigitCode();
  const otpHash = await hashValue(otpCode)
  const payload = {
    email,
    clientIp,
    otpCode:otpHash,
    attempt: 0,
  };

  // Store JSON string with expiry
  await redis.set(otpDataKey, JSON.stringify(payload), {
    EX: 2, // 2 minutes
  });
  //
  let ip = clientIp;

  addOtpLogProducer({ ip, userId: emailId, otpHash });
  // Send Otp on email

  return successResponse(payload, "Otp send successfuly", 201);
};

export const userLoginService = async ({email,password,clientIp}:userloginServiceType)=>{

}

export const loginWithGoogleService = async ({email,password,otp,clientIp}:forgetPasswordServiceType)=>{

}

export const forgetPasswordService = async ({email,password,otp,clientIp}:forgetPasswordServiceType)=>{

}