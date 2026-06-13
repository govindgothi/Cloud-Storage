import { email } from "zod";

/**
 * Centralized Redis key generators for authentication, rate-limiting, and OTP workflows.
 * Using helper functions ensures consistency across registration, login, and verification services.
 */
export const redisKeys = {
  /** Rate-limiting track keys */
  otpIpLimit: (ip: string) => `otp:ip:${ip}`,
  otpEmailLimit: (email: string) => `otp:email:${email}`,

  /** Security blocks / lockout keys */
  otpBlockedIp: (ip: string) => `otp:block:${ip}`,
  otpBlockedEmail: (email: string) => `otp:block:${email}`,

  /** Temporary storage for verification codes */
  otpData: (email: string) => `otp:data:${email}`,

  /** Otp session token */ 
  otpAuthSession: (email:string) => `otp:session:${email}`,
  
  /** Session tracking (if needed for login/session replacement later) */
  userSession: (userId: string) => `session:user:${userId}`,
};

export const redisRolesKey = {
  redisRoleName: (role:string) =>  `roles:role:${role}`,
  redisRoleId: (id:number) =>  `roles:id:${id}`
}