import { query } from "../db/postgresSql.js";
import { GetUserParams } from "../interface/auth.interface.js"

// export const getUsersDetailByEmail = async({fields=["id"],email,id}:GetUserParams)=>{

//  const fieldsmap = fields.join(",")
//  let que = `SELECT ${fieldsmap} FROM users WHERE `
//  let params = []
//  if(email){
//    que += `email = ?`
//    params.push(email)
//  }
//  if(id){
//     que += `OR id = ?`
//     params.push(id)
//  }
//  const data = await query(
//     que,
//     params
//  )
//  return data 
// }   

export const getUsersDetailByEmail = async ({
  fields = ["id"],
  email,
  id,
}: GetUserParams) => {
  const fieldsmap = fields.join(",");

  let que = `SELECT ${fieldsmap} FROM users WHERE `;
  const params: any[] = [];
  let index = 1;

  if (email) {
    que += `email = $${index++}`;
    params.push(email);
  }

  if (id) {
    if (email) {
      que += ` OR `;
    }
    que += `id = $${index++}`;
    params.push(id);
  }

  const data = await query(que, params);

  return data;
};

export const getAllRoles = async()=>{
     const result = await query(`
      SELECT
        id,
        role,
        display_role
      FROM roles
      WHERE deleted = false
    `);
    return result
}