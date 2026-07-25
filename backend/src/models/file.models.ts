import { PoolClient } from "pg";
import { CreateFileParams } from "../interface/file.interface.js";
import { query } from "../db/postgresSql.js";
import { directoryIds } from "../interface/directory.interface.js";

export const createFileQuery = async (
  conn: PoolClient,
  {
    parentId,
    userId,
    filename,
    type,
    size,
    lastModified,
    lastModifiedDate,
    originalFilename,
    extension,
    parentAncestorIds,
  }: CreateFileParams,
) => {
  const result = await conn.query(
    `
    INSERT INTO files (
      parent_id,  
      user_id,
      original_filename,
      filename,
      mime_type,
      extension,
      file_size,
      last_modified,
      last_modified_date,
      storage_path
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )
    RETURNING *;
    `,
    [
      parentId,
      userId,
      originalFilename,
      filename,
      type,
      extension,
      size,
      lastModified,
      lastModifiedDate,
      originalFilename,
    ],
  );

  return result;
};

export const getFileByIdQuery = async ({ id, userId }: directoryIds) => {
  let que = `
   SELECT fs.*,d.ancestor_ids,d.id as dir_id FROM files AS fs
   LEFT JOIN directories AS d ON fs.parent_id = d.id
   WHERE fs.is_deleted = FALSE AND fs.user_id = $1 AND fs.id = $2
  `;
  let params = [userId, id];
  const result = await query(que, params);
  return result;
};

export const updateAncestorDirectorySizeQuery = async (
  conn: PoolClient,
  parentId: number,
  sizeDelta: number,
): Promise<void> => {
  const query = `
    UPDATE directories
    SET total_size_bytes = total_size_bytes + $1
    WHERE id IN (
      SELECT unnest(array_append(ancestor_ids, id))
      FROM directories
      WHERE id = $2
    );
  `;

  await conn.query(query, [sizeDelta, parentId]);
};

export const deleteFileQuery = async (
  conn: PoolClient,
  { id, userId }: directoryIds
) => {
  let que = `
 UPDATE files 
 SET is_deleted = $1
 WHERE is_deleted = FALSE AND user_id = $2 AND id = $3
 `;
  let params = ['TRUE', userId, id];

  const result = await conn.query(que, params);
  return result;
};


export const getAllAffectedFileDetail = async ({
  id,
  userId,
}: directoryIds) => {
  const que = `
    WITH dirs AS (
    SELECT DISTINCT id
    FROM (
        SELECT $1::bigint AS id

        UNION

        SELECT id
        FROM directories
        WHERE $1 = ANY(ancestor_ids)
          AND user_id = $2

        UNION

        SELECT unnest(ancestor_ids) AS id
        FROM directories
        WHERE $1 = ANY(ancestor_ids)
          AND user_id = $2
    ) d
)
SELECT
    COALESCE(SUM(f.file_size), 0) AS total_size,
    ARRAY_AGG(DISTINCT dirs.id ORDER BY dirs.id) AS directory_ids
FROM dirs
LEFT JOIN files f
    ON f.parent_id = dirs.id
   AND f.is_deleted = FALSE;
  `;

  const params = [id, userId];

  const result = await query(que, params);
  return result;
};