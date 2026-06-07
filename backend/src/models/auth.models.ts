// import { query } from "../db/mysql.db.js";
import {
  AddOtpLogsModel,
  IpParams,
  RegisterUserModel,
  updateEmailBlock,
  updateIpBlockType,
  UpdateOtpLogModel,
} from "../interface/auth.interface.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { success } from "zod";
import { getRedisClient } from "../db/redis.db.js";
import { EmailParams } from "../interface/common.interface.js";
import { query } from "../db/postgresSql.js";
import { DAY } from "../constant/globle.js";

// export const getBlockedIps = async ({ ip }: IpParams) => {
//   const data = await query(
//     `SELECT *  FROM blocked_ips WHERE ip = ?`,
//     [ip],
//   );
//   return data;
// };

// export const getBlockedEmails = async ({ email }: EmailParams) => {
//   const data = await query(`SELECT * FROM blocked_emails WHERE email = ?`, [
//     email,
//   ]);
//   return data;
// };

// export const insertBlockedIp = async ({ ip }: IpParams) => {
//   const data = await query(
//     `INSERT INTO blocked_ips 
//     (ip, reason, block_count, blocked_until, created_at)
//     VALUES (?, 'spam', 0, NULL, NOW())
//     `,
//     [ip]
//   );
//   return data;
// };

// export const insertBlockedEmail = async ({ email }: EmailParams) => {
//   const data = await query(
//     `INSERT INTO blocked_emails
//     (email, reason, block_count, blocked_until, created_at)
//     VALUES (?, 'spam', 0, NULL, NOW())
//     `,
//     [email]
//   );
//   return data;
// };

export const getBlockedIps = async ({ ip }: IpParams) => {
  const sql = `
    SELECT *
    FROM blocked_ips
    WHERE ip = $1
  `;

  const data = await query(sql, [ip]);
  return data;
};

export const getBlockedEmails = async ({ email }: EmailParams) => {
  const sql = `
    SELECT *
    FROM blocked_emails
    WHERE email = $1
  `;

  const data = await query(sql, [email]);
  return data;
};

export const insertBlockedIp = async ({ ip }: IpParams) => {
  const sql = `
    INSERT INTO blocked_ips (
      ip,
      reason,
      block_count,
      blocked_until,
      created_at
    )
    VALUES (
      $1,
      'spam',
      0,
      NULL,
      NOW()
    )
  `;

  const data = await query(sql, [ip]);
  return data;
};

export const insertBlockedEmail = async ({ email }: EmailParams) => {
  const sql = `
    INSERT INTO blocked_emails (
      email,
      reason,
      block_count,
      blocked_until,
      created_at
    )
    VALUES (
      $1,
      'spam',
      0,
      NULL,
      NOW()
    )
  `;

  const data = await query(sql, [email]);
  return data;
};

export const updateBlockedIp = async ({ ip }: IpParams) => {
  const sql = `
    UPDATE blocked_ips
    SET
      block_count = block_count + 1,
      updated_at = NOW()
    WHERE ip = $1
  `;

  const data = await query(sql, [ip]);
  return data;
};

export const updateBlockedEmail = async ({ email }: EmailParams) => {
  const sql = `
    UPDATE blocked_emails
    SET
      block_count = block_count + 1,
      updated_at = NOW()
    WHERE email = $1
  `;

  const data = await query(sql, [email]);
  return data;
};

// export const updateIpBlockStatusModel = async ({ip,redisBlockedIpKey}: updateIpBlockType) => {

//   const redis = getRedisClient();

//   const rows: any = await getBlockedIps({ip})
//   if (!rows.length) throw new ApiError("data is not found give ip",404,false);

//   const currentCount = rows[0].block_count || 0;
//   const newCount = currentCount + 1;

//   const blockDays = newCount >= 2 ? 15 : 7;

//   const blockedUntil = new Date(
//     Date.now() + blockDays * DAY * 1000
//   );

//   const result = await query(
//     `UPDATE blocked_ips
//     SET 
//       block_count = ?,
//       blocked_until = ?
//     WHERE ip = ?
//     `,
//     [newCount, blockedUntil, ip]
//   );

//   await redis.expire(redisBlockedIpKey, blockDays * DAY);
//   return result;
// };
export const updateIpBlockStatusModel = async ({
  ip,
  redisBlockedIpKey,
}: updateIpBlockType) => {
  const redis = getRedisClient();

  const rows: any = await getBlockedIps({ ip });

  if (!rows.length) {
    throw new ApiError("data is not found give ip", 404, false);
  }

  const currentCount = rows[0].block_count || 0;
  const newCount = currentCount + 1;

  const blockDays = newCount >= 2 ? 15 : 7;

  const blockedUntil = new Date(
    Date.now() + blockDays * DAY * 1000
  );

  const result = await query(
    `
    UPDATE blocked_ips
    SET
      block_count = $1,
      blocked_until = $2
    WHERE ip = $3
    RETURNING *
    `,
    [newCount, blockedUntil, ip]
  );

  await redis.expire(redisBlockedIpKey, blockDays * DAY);

  return result;
};
// export const updateEmailBlockStatusModel = async ({
//   email,
//   redisBlockedEmailKey,
// }: updateEmailBlock) => {
//   const redis = getRedisClient();
//   const rows: any = await getBlockedEmails({email})
//   if (!rows.length) throw new ApiError("data is not found give ip",404,false);

//   const currentCount = rows[0].block_count || 0;
//   const newCount = currentCount + 1;

//   const blockDays = newCount >= 2 ? 15 : 7;

//   const blockedUntil = new Date(
//     Date.now() + blockDays * DAY * 1000
//   );

//   const result = await query(
//     `UPDATE blocked_emails
//     SET 
//     block_count = ?,
//     blocked_until = ?
//     WHERE email = ?
//     `,
//     [newCount, blockedUntil, email]
//   );

//   await redis.expire(redisBlockedEmailKey, blockDays * DAY);

//   return result;
// };

export const updateEmailBlockStatusModel = async ({
  email,
  redisBlockedEmailKey,
}: updateEmailBlock) => {
  const redis = getRedisClient();

  const rows: any = await getBlockedEmails({ email });

  if (!rows.length) {
    throw new ApiError("data is not found give ip", 404, false);
  }

  const currentCount = rows[0].block_count || 0;
  const newCount = currentCount + 1;

  const blockDays = newCount >= 2 ? 15 : 7;

  const blockedUntil = new Date(
    Date.now() + blockDays * DAY * 1000
  );

  const result = await query(
    `
    UPDATE blocked_emails
    SET
      block_count = $1,
      blocked_until = $2
    WHERE email = $3
    RETURNING *
    `,
    [newCount, blockedUntil, email]
  );

  await redis.expire(redisBlockedEmailKey, blockDays * DAY);

  return result;
};

// export const addOtpLogsData = async ({ clientIp, email, otpHash }: AddOtpLogsModel) => {
//   const sql = `
//   INSERT INTO otp_log (sender_id, ip, otp_hash, purpose, expires_at, attempts, verified)
//   VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE), ?, ?)
// `;
//   const data = await query(sql, [
//     0,
//     clientIp,
//     otpHash,
//     "register",
//     0,
//     false,
//   ]);
//   return data;
// };

export const addOtpLogsData = async ({
  clientIp,
  email,
  otpHash,
}: AddOtpLogsModel) => {
  const sql = `
    INSERT INTO otp_log (
      sender_id,
      ip,
      otp_hash,
      purpose,
      expires_at,
      attempts,
      verified
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      NOW() + INTERVAL '2 minutes',
      $5,
      $6
    )
  `;

  const data = await query(sql, [
    0,
    clientIp,
    otpHash,
    "register",
    0,
    false,
  ]);

  return data;
};
// export const updateOtpLogs = async ({ email, verified }: UpdateOtpLogModel) => {
//   let sql = `
//     UPDATE otp_log
//     SET attempts = attempts + 1
//   `;
//   const params: any[] = [];

//   if (verified !== undefined) {
//     sql += `, verified = ?`;
//     params.push(verified);
//   }

//   sql += `
//     WHERE email = ?
//     ORDER BY created_at DESC
//     LIMIT 1
//   `;
//   params.push(email);

//   const data = await query(sql, params);
//   return data;
// };
export const updateOtpLogs = async ({
  email,
  verified,
}: UpdateOtpLogModel) => {
  let sql: string;
  let params: any[];

  if (verified !== undefined) {
    sql = `
      UPDATE otp_log
      SET
        attempts = attempts + 1,
        verified = $1
      WHERE id = (
        SELECT id
        FROM otp_log
        WHERE email = $2
        ORDER BY created_at DESC
        LIMIT 1
      )
    `;
    params = [verified, email];
  } else {
    sql = `
      UPDATE otp_log
      SET attempts = attempts + 1
      WHERE id = (
        SELECT id
        FROM otp_log
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1
      )
    `;
    params = [email];
  }

  return await query(sql, params);
};
// export const registerQuery = async ({
//   username,
//   email,
//   password,
//   profileUrl,
// }: RegisterUserModel) => {
//   const data = await query(
//     `INSERT INTO users 
//   (username,email,password,profile_url,is_active,is_deleted)
//   VALUES (?,?,?,?,?,?)
//   `,
//     [username, email, password, profileUrl, 1, 0],
//   );
//   return data;
// };

export const registerQuery = async ({
  username,
  email,
  password,
  profileUrl,
}: RegisterUserModel) => {
  const data = await query(
    `
    INSERT INTO users (
      username,
      email,
      password,
      profile_url
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [username, email, password, profileUrl]
  );

  return data;
};
