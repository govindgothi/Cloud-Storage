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
import {
  addOtpLogProducer,
  insertEmail,
  insertIp,
  updateEmailBlockStatusProducer,
  updateIpBlockStatusProducer,
} from "../producers/otpLogs.producers.js";
import { hashValue, verifyHash } from "../utils/bcrypt.utils.js";
import {
  forgetPasswordServiceType,
  logoutParamsType,
  replaceSessionType,
  userloginServiceType,
} from "../interface/auth.interface.js";
import { createToken } from "../utils/jwtToken.utils.js";
import {
  createSession,
  deleteAllSessionByUserId,
  deleteSessionBySessionId,
  getLoginChallengeUserData,
  getUserSessions,
  loginChallengeSession,
} from "../utils/sessions.utils.js";
import {
  sessionIdParams,
  userIdParams,
} from "../interface/common.interface.js";
import { redisKeys } from "../constant/redisKey.js";

export const userRegisterService = async (data: UserRegisterInput) => {
  /** Access the Redis instance to store temporary OTP verification tokens and otp  */
  const redis = getRedisClient();
  const { username, email, password, otp } = data;
  /** Create profile url*/ 
  const profileUrl = getProfileUrl(username);
  /** Array of field, we want from database*/ 
  const fields = ["id", "email"];
  /** Find user in users table by email*/ 
  const isUser = await getUsersDetailByEmail({ fields, email });
  
  if (isUser && isUser.length > 0) {
    /** Throw error, user is already present in users table with this email*/ 
    throw new ApiError("This Email is already exists", 403, false);
  }
  /**otp data key, find otp data using this key*/ 
  const otpDataKey = redisKeys.otpData(email)
  /**find otp stored data for given email */ 
  const otpData = await redis.get(otpDataKey);

  if (!otpData || otpData == null) {
    /** Throw error is otp data is not found*/ 
    throw new ApiError("Otp is expired", 401, false);
  }
  /** Parse otp data string to json*/ 
  const parsedOtp = JSON.parse(otpData);
  /**Check how much attempt user use for otp verify */  
  if (parsedOtp.attempt > 4) {
    /** Throw error, user exceed the limit of otp verify attemp*/ 
    throw new ApiError("Otp attemp is exceed", 401, false);
  }
  /** Check otp is matched or not */ 
  const isOtpMatched = await verifyHash(otp, parsedOtp.otpCode);
  if (isOtpMatched == false || !isOtpMatched) {
    /** Throw error, otp is incorrect*/ 
    throw new ApiError("Incorrect otp pin", 401, false);
  }
  /** Create password hash to store securely in db*/ 
  const hashPassword = await hashValue(password);
  /**Call db query to store or register user */ 
  const userStore = await registerQuery({
    username,
    email,
    password: hashPassword,
    profileUrl,
  });
  /** Return success payload to controller after user succefuly register*/ 
  if (userStore && userStore.length > 0 && userStore[0].id) {
    return successResponse(
      { id: userStore[0].id },
      "User successfuly register",
      201,
    );
  }
};

export const sendOtpService = async ({
  email,
  clientIp,
  otpPurpose = "register",
}: {
  email: string;
  clientIp: string;
  otpPurpose: string;
}) => {
  /** Access the Redis instance to store temporary OTP verification tokens and otp  */
  const redis = getRedisClient();

  /** Keys for validate limited request by email or any ip  */
  const ipLimitKey = redisKeys.otpIpLimit(clientIp);
  const emailLimitKey = redisKeys.otpEmailLimit(email);

  /** Keys for block any email or ip if his limit of request is over or spamming*/
  const redisBlockedIpKey = redisKeys.otpBlockedIp(clientIp);
  const redisBlockedEmailKey = redisKeys.otpBlockedEmail(email);

  /** Key for store otp related data store
   *  {otphash,attempt,timetoexpire otp,email,clientIp,otpPurpose}  */
  const otpDataKey = redisKeys.otpData(email);

  /** Key for store session of otp valide and request from authentic source */
  const otpAuthSession = redisKeys.otpAuthSession(email);

  /** Check if any otp exists on give email id*/
  const existingData = await redis.get(otpDataKey);

  if (existingData) {
    /** Check, how much to remaining to again request */
    const ttl = await redis.ttl(otpDataKey);
    /** Send error response with message try after remaining time,
     *  you already sent request for otp with in certain time limit   */
    throw new ApiError(`Try again in ${ttl} seconds`, 429, false);
  }

  /** Check, Is ip block or not */
  const isIpBlocked = await redis.get(redisBlockedIpKey);

  if (isIpBlocked) {
    /** Check, how much time to remain unblock ip*/
    const ttl = await redis.ttl(redisBlockedIpKey);
    /** Send error respose ip is block, try after remaining time*/
    throw new ApiError(
      `Too many requests. Try again in ${ttl} seconds`,
      429,
      false,
    );
  }

  /** Check, Is email block or not */
  const isEmailBlocked = await redis.get(redisBlockedEmailKey);

  if (isEmailBlocked) {
    /** Check,  how much to remain unblock email*/
    const ttl = await redis.ttl(redisBlockedEmailKey);
    /** Send error respose email is block, try after remaining time*/
    throw new ApiError(
      `Too many requests. Try again in ${ttl} seconds`,
      429,
      false,
    );
  }

  /** Check otp purpose*/
  if (otpPurpose === "register") {
    /** field which we needed or require from database*/
    let fields = ["id"];
    /** Check user is already exist or not */
    const isUserExists = await getUsersDetailByEmail({ fields, email });
    if (isUserExists && isUserExists.length > 0) {
      /**Send error response, user is already register with give email*/
      throw new ApiError(
        "User with this email is already registered",
        409,
        false,
      );
    }
  }

  // Checking request count ip for bloacking and increase count of ip
  const requestCountIp = await redis.incr(ipLimitKey);
  if (requestCountIp === 1) {
    /** Add limit on ip, It exceed the limit */
    await redis.expire(ipLimitKey, 900); // 15 mins
  }

  /** Increment the request count for this email;
   * creates the key with a value of 1 if it doesn't exist  */
  const requestCountEmail = await redis.incr(emailLimitKey);
  if (requestCountEmail === 1) {
    /** Set a 15-minute expiration window on the first request to initialize the rate-limit lifecycle  */
    await redis.expire(emailLimitKey, 900); // 15 mins
  }

  /** Enforce anti-spam policy:
   * If a user exceeds 5 OTP requests within the 15-minute window, trigger a lockout  */
  if (requestCountEmail > 5) {
    /** 1. Instantly isolate the attacker by blacklisting the email in Redis cache for 30 minutes  */
    await redis.set(redisBlockedEmailKey, "1", {
      EX: 1800, // 30 mins
    });
    /**  Offload metrics to an asynchronous message queue to persist the spam count in the SQL database */
    updateEmailBlockStatusProducer({ email, redisBlockedEmailKey });

    // 3. Reject the request with a 429 status code.
    throw new ApiError(
      `Too many requests on Email. Try again in 30 minute`,
      429,
      false,
    );
  }

/** Enforce anti-spam policy:
   * If a user exceeds 7 OTP requests from same ip within the 15-minute window, trigger a lockout  */ 
    if (requestCountIp > 7) {
    /** 1. Instantly isolate the attacker by blacklisting the IP in Redis cache for 30 minutes  */
    await redis.set(redisBlockedIpKey, "1", {
      EX: 1800, // 30 mins
    });
    updateIpBlockStatusProducer({ ip: clientIp, redisBlockedIpKey });
    throw new ApiError(
      `Too many requests on Ip. Try again in 30 seconds`,
      429,
      false,
    );
  }
  /** Check is email or ip record in data base */
  const [blockedIps, blockedEmails] = await Promise.all([
    getBlockedIps({ ip: clientIp }),
    getBlockedEmails({ email }),
  ]);

  /** If user request first time with give ip we insert in to db for update block count with zero  */
  if (!(blockedIps.length > 0)) {
    insertIp({clientIp});
  }
  if (!(blockedEmails.length > 0)) {
    insertEmail({ email });
  }

  /** Generate six digit otp code */ 
  const otpCode = generateSixDigitCode();

  /** Create hash from six digit opt code*/ 
  const otpHash = await hashValue(otpCode);
  const payload = {
    email,
    clientIp,
    otpPurpose,
  };
  /** Create token for send in cookie to validate on verifying otp apis*/ 
  const token = createToken(payload, "2m");
  // Store JSON string with expiry
  const otpData = {
    ...payload,
    otpCode: otpHash,
    attempt: 0,
  };
  /** Set otp data and token in session*/ 
  const [a,b] = await Promise.all([
    await redis.set(otpDataKey, JSON.stringify(otpData), {  EX: 120  }),
    await redis.set(otpAuthSession, token, { EX: 120  })
  ])
  /** Maintain all otp logs */ 
  addOtpLogProducer({ clientIp, email, otpHash });


  return successResponse(
    { ...payload, token, otp: otpCode },
    "Otp send successfuly",
    200,
  );
};

export const userLoginService = async ({
  email,
  password,
  clientIp,
}: userloginServiceType) => {
  /** field we want from users*/ 
  let fields = ["id", "email", "password", "created_at"];
  /** get user data from user table */ 
  const userData = await getUsersDetailByEmail({ fields, email });
  
  /**Check user present or not */ 
  if (!userData || userData == null || userData.length == 0) {
  /**Throw error user is not found in database  */ 
    throw new ApiError("Invalide Credential", 404, false);
  }
  /** Check password is valid or not */ 
  let isValidPassword = await verifyHash(password, userData[0].password);
  if (!isValidPassword) {
  /* Throw error password is not matched */ 
    throw new ApiError("Invalide Credential", 404, false);
  }
  const userId = userData[0].id;
  /** Get session store by userid or we can list sessions of user*/
  const { sessionsList, sessionIds } = await getUserSessions({ userId });
  /** Check session list length and add condition if lenth is greater then 2*/ 
  if (sessionIds.length === 2) {
  /** create token  and session for login challenge*/
    const token = await loginChallengeSession({ userId, email, clientIp });
    /** return session list with token so user can logout or remove one session and login*/ 
    return {
      message:
        "You have reached the maximum limit of 2 devices. Select one device to log out and continue.",
      statusCode: 409,
      success: false,
      token: token,
      data: [{ sessionsList: sessionsList, challengeToken: token }],
    };
  }
  /** create login session and token*/
  const token = await createSession({ userId, email, clientIp });
  /** returm token for add in cookie, email and userId for localstorage*/ 
  return {
    user: { token: token, email: email, userId: userId },
    success: true,
    statusCode: 201,
  };
};

export const loginWithGoogleService = async ({
  email,
  password,
  otp,
  clientIp, 
}: forgetPasswordServiceType) => {};

export const forgetPasswordService = async ({
  email,
  password,
  otp,
  clientIp,
}: forgetPasswordServiceType) => {};

export const replaceSessionService = async ({
  sessionId,
  userId,
  clientIp,
}: replaceSessionType) => {
  // get challenge login user data
  const loginUserData = await getLoginChallengeUserData({ userId });
  let email = loginUserData.email;
  /** Delete session give by user using session Id  */
  const deletedSession = await deleteSessionBySessionId({ sessionId });

  /** Create new session and return token */
  const token = await createSession({ userId, email, clientIp });
  /**Return success payload */ 
  return successResponse(
    {
      token,
      email,
      userId,
    },
    "User logged in Successfully",
    201,
  );
};

export const logoutService = async ({
  userId,
  email,
  sessionId,
}: logoutParamsType) => {
  /** Delete user session by session id*/ 
  const deletedSession = await deleteSessionBySessionId({ sessionId });
  if (deletedSession == true) {
    /**Return success payload*/ 
    return successResponse(null, "User logout succesfuly.", 200);
  }
  /**Throw error, something is failed to logout or session is not deleted*/ 
  throw new ApiError("Failed to logout user", 500, false);
};

export const logoutFromAllDeviceService = async ({ userId }: userIdParams) => {
  const deletedSessions = await deleteAllSessionByUserId({ userId });
  console.log("deleted",deletedSessions)
  if (deletedSessions == true) {
    return successResponse(
      null,
      "User logout from all device successfuly",
      200,
    );
  }
  throw new ApiError(
    "Something went wrong while logout user from all device",
    400,
    false,
  );
};

export const logoutByAdminService = async ({ sessionId }: sessionIdParams) => {
  const deletedSession = await deleteSessionBySessionId({ sessionId });
  if (deletedSession == true) {
    return successResponse(null, "User logout succesfuly.", 200);
  }
};

export const logoutFromAllDeviceByAdminService = async ({
  userId,
}: userIdParams) => {
  const deletedSessions = await deleteAllSessionByUserId({ userId });
  if (deletedSessions == true) {
    return successResponse(
      null,
      "User logout from all device successfuly",
      200,
    );
  }
  throw new ApiError(
    "Something went wrong while logout user from all device",
    400,
    false,
  );
};

export const listOfAllLoginUsersService = async () => {};
