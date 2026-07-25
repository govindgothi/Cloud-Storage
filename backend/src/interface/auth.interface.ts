import { clientIpParams, Email, EmailParams, idParams, roleIdParams, sessionIdParams, tokenParams, userIdParams } from "./common.interface.js";

 
/**
 * Request payload structure for user registration.
 * @route POST /api/v1/auth/register
 */
export interface UserRegisterParams extends Email {
  username: string;
  password: string;
  roleId: number;
  otp: string;
}


export interface IpParams {
  ip: string;
}


export interface GetUserParams {
  email?: string;
  id?: number;
  fields: string[];
};


export type AddOtpLogsModel = clientIpParams & EmailParams & {
  otpHash: string;
};

export type UpdateOtpLogModel = {
  email: string;
  verified?: boolean;
};

export type RegisterUserModel = {
  username: string;
  email: string;
  password: string;
  roleId:number;
  profileUrl?: string;
};

export type MailBodyProducer = {
  to: string;
  body: string;
  subject: string;
};

export type updateEmailBlock = {
  email:string,
  redisBlockedEmailKey:string
}

export type updateIpBlockType = {
  ip: string,
  redisBlockedIpKey: string
}

export type customIpRateLimitType ={
  ipKey:string,
  emailKey:string,
}

export type userloginServiceType = EmailParams & clientIpParams &{
 password:string
}
export type forgetPasswordServiceType = EmailParams & clientIpParams & {
  otp:number,
  password:string
}

export type createSessionType = userIdParams & EmailParams & clientIpParams & roleIdParams & { }

export type replaceSessionType = sessionIdParams & userIdParams & clientIpParams & { }

export type successLoginResponseType = userIdParams & EmailParams & tokenParams & { }

export type logoutParamsType = userIdParams & EmailParams & sessionIdParams & { }
