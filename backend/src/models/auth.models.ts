import { query } from "../db/mysql.db.js"
import { UserRegisterInput } from "../validations/auth.validations.js"

export const registerQuery = async(username:string,email:string,password:string,profileUrl:string) =>{
  const data = await query(
  `INSERT INTO users 
  (username,email,password,profile_url,is_active,is_deleted)
  VALUES (?,?,?,?,?,?)
  `,
  [username,email,password,profileUrl,1,0]
  )
  return data
}