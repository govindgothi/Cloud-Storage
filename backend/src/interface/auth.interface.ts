import { clientIpParams, EmailParams, idParams, sessionIdParams, tokenParams, userIdParams } from "./common.interface.js";

 
export interface IpParams {
  ip: string;
}

export interface Id {
  id: number;
}

export type GetUserParams = {
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

export type createSessionType = userIdParams & EmailParams & clientIpParams &  { }

export type replaceSessionType = sessionIdParams & userIdParams & clientIpParams & { }

export type successLoginResponseType = userIdParams & EmailParams & tokenParams & { }

export type logoutParamsType = userIdParams & EmailParams & sessionIdParams & { }
