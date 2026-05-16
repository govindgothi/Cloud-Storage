import { query } from "../db/mysql.db.js";
import {
  AddOtpLogsModel,
  EmailParams,
  IpParams,
  RegisterUserModel,
  updateEmailBlock,
  updateIpBlockType,
  UpdateOtpLogModel,
} from "../interface/auth.interface.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { success } from "zod";
import { getRedisClient } from "../db/redis.db.js";

export const getBlockedIps = async ({ ip }: IpParams) => {
  const data = await query(
    `SELECT *  FROM blocked_ips WHERE ip = ?`,
    [ip],
  );
  return data;
};

export const getBlockedEmails = async ({ email }: EmailParams) => {
  const data = await query(`SELECT * FROM blocked_emails WHERE email = ?`, [
    email,
  ]);
  return data;
};

export const insertBlockedIp = async ({ ip }: IpParams) => {
  const data = await query(
    `INSERT INTO blocked_ips 
    (ip, reason, block_count, blocked_until, created_at)
    VALUES (?, 'spam', 0, NULL, NOW())
    `,
    [ip]
  );
  return data;
};

export const insertBlockedEmail = async ({ email }: EmailParams) => {
  const data = await query(
    `INSERT INTO blocked_emails
    (email, reason, block_count, blocked_until, created_at)
    VALUES (?, 'spam', 0, NULL, NOW())
    `,
    [email]
  );
  return data;
};

const DAY = 24 * 60 * 60; // seconds

export const updateIpBlockStatusModel = async ({ip,redisBlockedIpKey}: updateIpBlockType) => {

  const redis = getRedisClient();

  const rows: any = await getBlockedIps({ip})
  if (!rows.length) throw new ApiError("data is not found give ip",404,false);

  const currentCount = rows[0].block_count || 0;
  const newCount = currentCount + 1;

  const blockDays = newCount >= 2 ? 15 : 7;

  const blockedUntil = new Date(
    Date.now() + blockDays * DAY * 1000
  );

  const result = await query(
    `UPDATE blocked_ips
    SET 
      block_count = ?,
      blocked_until = ?
    WHERE ip = ?
    `,
    [newCount, blockedUntil, ip]
  );

  await redis.expire(redisBlockedIpKey, blockDays * DAY);
  return result;
};

export const updateEmailBlockStatusModel = async ({
  email,
  redisBlockedEmailKey,
}: updateEmailBlock) => {
  const redis = getRedisClient();
  const rows: any = await getBlockedEmails({email})
  if (!rows.length) throw new ApiError("data is not found give ip",404,false);

  const currentCount = rows[0].block_count || 0;
  const newCount = currentCount + 1;

  const blockDays = newCount >= 2 ? 15 : 7;

  const blockedUntil = new Date(
    Date.now() + blockDays * DAY * 1000
  );

  const result = await query(
    `UPDATE blocked_emails
    SET 
    block_count = ?,
    blocked_until = ?
    WHERE email = ?
    `,
    [newCount, blockedUntil, email]
  );

  await redis.expire(redisBlockedEmailKey, blockDays * DAY);

  return result;
};

export const addOtpLogsData = async ({ ip, userId, otpHash }: AddOtpLogsModel) => {
  console.log({ ip, userId, otpHash })
  const sql = `
  INSERT INTO otp_log (sender_id, ip, otp_hash, purpose, expires_at, attempts, verified)
  VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE), ?, ?)
`;
  const data = await query(sql, [
    userId ?? null,
    ip,
    otpHash,
    "register",
    0,
    false,
  ]);
  return data;
};

export const updateOtpLogs = async ({ email, verified }: UpdateOtpLogModel) => {
  let sql = `
    UPDATE otp_log
    SET attempts = attempts + 1
  `;
  const params: any[] = [];

  if (verified !== undefined) {
    sql += `, verified = ?`;
    params.push(verified);
  }

  sql += `
    WHERE email = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;
  params.push(email);

  const data = await query(sql, params);
  return data;
};

export const registerQuery = async ({
  username,
  email,
  password,
  profileUrl,
}: RegisterUserModel) => {
  const data = await query(
    `INSERT INTO users 
  (username,email,password,profile_url,is_active,is_deleted)
  VALUES (?,?,?,?,?,?)
  `,
    [username, email, password, profileUrl, 1, 0],
  );
  return data;
};
