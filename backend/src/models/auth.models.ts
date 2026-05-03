import { query } from "../db/mysql.db.js";

const getOtpLogs = async (email: string) => {
  const data = await query(
   `SELECT
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 5 MINUTE THEN 1 END) AS last_5_min,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 10 MINUTE THEN 1 END) AS last_10_min,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 30 MINUTE THEN 1 END) AS last_30_min,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 1 HOUR THEN 1 END) AS last_1_hour,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 6 HOUR THEN 1 END) AS last_6_hour,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 1 DAY THEN 1 END) AS last_1_day,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 5 DAY THEN 1 END) AS last_5_day,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 1 MONTH THEN 1 END) AS last_1_month,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL 1 YEAR THEN 1 END) AS last_1_year
    FROM 
     `, 
    [email],
  );
  return data
};
