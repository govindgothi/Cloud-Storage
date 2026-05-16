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

export type EmailParams = {
  email: string;
};

export type AddOtpLogsModel = {
  ip: string;
  userId: number;
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