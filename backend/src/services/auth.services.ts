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
import { forgetPasswordServiceType, logoutParamsType, replaceSessionType, successLoginResponseType, userloginServiceType } from "../interface/auth.interface.js";
import { createToken, decodeToken } from "../utils/jwtToken.utils.js";
import { createSession, deleteAllSessionByUserId, deleteSessionBySessionId, getLoginChallengeUserData, getUserSessions, loginChallengeSession } from "../utils/sessions.utils.js";
import { sessionIdParams, userIdParams } from "../interface/common.interface.js";
import { success } from "zod";

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
   console.log("otpData",otpData,otpDataKey)
   if(!otpData || otpData == null){
    throw new ApiError("Otp is expired",401,false)
   }
  const parsedOtp = JSON.parse(otpData)
  if(parsedOtp.attempt > 4){
    throw new ApiError("Otp attemp is exceed",401,false)
  }
  const isOtpMatched = await verifyHash(otp,parsedOtp.otpCode)
  console.log("isOtpMatched",isOtpMatched)
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
  console.log("USER",userStore)
  if (userStore.affectedRows == 1 && userStore.insertId) {
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
  otpType = "register"
}: {
  email: string;
  clientIp: string;
  otpType:string
}) => {
  const redis = getRedisClient();

  // keys for otp redis storage
  const ipLimitKey = `otp:ip:${clientIp}`;
  const emailLimitKey = `otp:email:${email}`;

  const redisBlockedIpKey = `otp:block:${clientIp}`;
  const redisBlockedEmailKey = `otp:block:${email}`;

  const otpDataKey = `otp:data:${email}`;

  const otpAuthSession = `otp:session:${email}`

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

  // check otp if otp type is register then check is user exist or not
  if(otpType === "register"){
  let fields = ["id"]
  const isUserExists = await getUsersDetailByEmail({fields,email})
  if(isUserExists && isUserExists.length > 0){
    console.log("isUserExists",isUserExists)
    throw new ApiError("On this email user is aleady register",401,false)
  }
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
  
  let ipId: number = blockedIps[0]?.id
  let emailId: number = blockedEmails[0]?.id


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
    otpType
  };
  const token = createToken(payload,"2m")
  // Store JSON string with expiry
  const otpData = {
  ...payload,
  otpCode: otpHash,
  attempt: 0,
  otpType:otpType
  };
  await redis.set(otpDataKey, JSON.stringify(otpData), {
    EX: 120, // 2 minutes
  });

  await redis.set(otpAuthSession,token,{
    EX:120
  })
  

  addOtpLogProducer({ clientIp, email, otpHash });
  // Send Otp on email

  return successResponse({...payload,token,otp:otpCode}, "Otp send successfuly", 201);
};

export const userLoginService = async ({email,password,clientIp}:userloginServiceType)=>{
  let fields = ["id", "email", "password", "created_at"]
  const userData = await getUsersDetailByEmail({fields,email})
  console.log(userData)
  if(!userData || userData == null || userData.length == 0){
    throw new ApiError("Invalide Credential",404,false)
  }
  let isValidPassword = await verifyHash(password,userData[0].password)
  if(!isValidPassword){
    throw new ApiError("Invalide Credential",404,false)
  }
  const userId = userData[0].id
  const {sessionsList,sessionIds} = await getUserSessions({userId})
  if(sessionIds.length === 2){
   const token = await loginChallengeSession({userId,email,clientIp})
   return {
      message:"You have reached the maximum limit of 2 devices. Select one device to log out and continue.",
      statusCode: 409,
      success: false,
      token: token,
      data: [{ sessionsList:sessionsList, challengeToken:token }]
   }
  }
  const token = await createSession({userId,email,clientIp})

  return{ user:{ token: token, email:email, userId:userId },success:false,statusCode:201}

}

export const loginWithGoogleService = async ({email,password,otp,clientIp}:forgetPasswordServiceType)=>{

}

export const forgetPasswordService = async ({email,password,otp,clientIp}:forgetPasswordServiceType)=>{

}

export const replaceSessionService = async ({sessionId,userId,clientIp}:replaceSessionType)=>{
 // get challenge login user data
 const loginUserData = await getLoginChallengeUserData({userId})
 let email = loginUserData.email
 // delete session giveb by user using  session Id
 const deletedSession = await deleteSessionBySessionId({sessionId})

 // create new session and return token
 const token = await createSession({userId,email,clientIp}) 

 return successResponse({
    token,
    email,
    userId
  }, "User logged in Successfully",201)
}


export const logoutService = async ({userId,email,sessionId}:logoutParamsType)=>{
  const deletedSession = await deleteSessionBySessionId({sessionId})
  if(deletedSession == true){
    return successResponse(null,"User logout succesfuly.",200)
  }
  throw new ApiError("Something went wrong while logout",400,false)
}

export const logoutFromAllDeviceService = async({userId}:userIdParams)=>{
const deletedSessions = await deleteAllSessionByUserId({userId})
if(deletedSessions == true){
  return successResponse(null,"User logout from all device successfuly",200)
}
throw new ApiError("Something went wrong while logout user from all device",400,false)
}

export const logoutByAdminService = async({sessionId}:sessionIdParams)=>{
  const deletedSession = await deleteSessionBySessionId({sessionId})
  if(deletedSession == true){
    return successResponse(null,"User logout succesfuly.",200)
  }
}

export const logoutFromAllDeviceByAdminService = async ({userId}:userIdParams)=>{
const deletedSessions = await deleteAllSessionByUserId({userId})
if(deletedSessions == true){
  return successResponse(null,"User logout from all device successfuly",200)
}
throw new ApiError("Something went wrong while logout user from all device",400,false)
}

export const listOfAllLoginUsersService = async ()=>{

}