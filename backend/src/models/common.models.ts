import { query } from "../db/mysql.db.js"
import { GetUserParams } from "../interface/auth.interface.js"

export const getUsersDetailByEmail = async({fields,email,id}:GetUserParams)=>{
 const fieldsmap = fields.join(",")
 let que = `SELECT ${fieldsmap} FROM users WHERE `
 let params = []
 if(email){
   que += `email = ?`
   params.push(email)
 }
 if(id){
    que += `OR id = ?`
    params.push(id)
 }
 const data = await query(
    que,
    params
 )
 return data 
}   