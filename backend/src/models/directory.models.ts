import { PoolClient } from "pg";
import { query } from "../db/postgresSql.js";
import {  CreateDirectoryQueryPayloadType, directoryIds, directoryNameIds, directoryParentId } from "../interface/directory.interface.js";

export const createDirectoryQuery = async ({
  userId,
  parentId,
  name,
  displayName,
  ancestorIds,
  depth
}: CreateDirectoryQueryPayloadType) => {
  const data = await query(
    `
    INSERT INTO directories (
      user_id,
      parent_id,
      name,
      display_name,
      ancestor_ids,
      depth
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
    `,
    [userId, parentId, name, displayName, ancestorIds, depth],
  );

  return data;
};

export const getDirectoryByIdQuery = async ({ id, userId,is_deleted = false,is_status = true }: directoryIds) => {
  let que =   `
    SELECT 
      id,
      user_id,
      parent_id,
      name,
      display_name,
      ancestor_ids,
      depth,
      created_at,
      updated_at
    FROM directories
    WHERE user_id = $1 AND is_deleted = $2 AND id = $3
    `
  if(id == null){
   return []
  }
  const data = await query(
    que,
    [userId,is_deleted,id],
  ); 

  return data;
};

export const getAllDirectoriesByParentId = async ({ parentId,userId,is_deleted = false,is_status = true }: directoryParentId) => {
  let que =   `
    SELECT 
      id,
      user_id,
      parent_id,
      name,
      display_name,
      ancestor_ids,
      depth,
      created_at,
      updated_at
    FROM directories
    WHERE user_id = $1 AND is_deleted = $2
    `
  let params = [userId,is_deleted]
  if(parentId == null){
   que +=  " AND parent_id IS NULL"
  }else{
   que +=  " AND parent_id = $3"
   params.push(parentId)
  }
  const data = await query(
    que,
    params,
  ); 

  return data;
}

export const deleteDirectoryQuery = async (
  conn: PoolClient,
  id: number
): Promise<void> => {
  await conn.query(
    `
    WITH affected AS (
      SELECT id
      FROM directories
      WHERE id = $1
         OR $1 = ANY(ancestor_ids)
    )
    UPDATE directories
    SET
      is_deleted = TRUE,
      deleted_at = NOW()
    WHERE id IN (SELECT id FROM affected);
    `,
    [id]
  );
  /*   updated_files AS (
      UPDATE files
      SET
        is_deleted = TRUE,
        deleted_at = NOW()
      WHERE directory_id IN (SELECT id FROM affected)
    )
    */ 
};

export const updateDirectoryNameQuery = async ({userId,id,name}:directoryNameIds) =>{
 let que = `UPDATE directories
    SET
        name = $1,
        updated_at = NOW()
    WHERE id = $2
      AND NOT is_deleted
      RETURNING *;
    `;
 let params = [name, id];
 const data = await query(que, params);
 return data;
}