import { transaction } from "../db/postgresSql.js";
import { generateS3Key, generateUploadUrl } from "../db/s3.aws.js";
import { directoryIds } from "../interface/directory.interface.js";
import { CreateFileInput } from "../interface/file.interface.js";
import { getDirectoryByIdQuery, updateAncestorDirectorySizeQuery } from "../models/directory.models.js";
import { createFileQuery, deleteFileQuery, getFileByIdQuery } from "../models/file.models.js";
import { getFileExtension } from "../utils/common.utils.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { successResponse } from "../utils/responseHandler.js";

export const createFileService = async ({parentId, userId, filename, type, size, lastModified, lastModifiedDate}:CreateFileInput) =>{
  // console.log({parentId, userId, filename, type, size, lastModified, lastModifiedDate})
  
  const dir = parentId == null ? []: await getDirectoryByIdQuery({id:parentId,userId})
  if(dir.length == 0 && parentId != null){
    throw new ApiError("Directory not found",404,false)
  }

  const extension = getFileExtension(filename)
  const s3storedFileName = generateS3Key(userId,filename)

  // const signedUploadUrl = await generateUploadUrl(s3storedFileName)
  
  // console.log("url",signedUploadUrl)

  let parentAncestorIds =  parentId == null ? null : [...dir[0].ancestor_ids, dir[0].id];  

  const result = await transaction(async (conn) => {
    const file = await createFileQuery(conn,{parentId, userId, filename, type, size, lastModified, lastModifiedDate,originalFilename:s3storedFileName,extension,parentAncestorIds})
    const update = await updateAncestorDirectorySizeQuery(conn,parentAncestorIds, size, "add", userId)
  });

  return successResponse({result},"filecreate successfully",201)
}

export const deleteFileService = async ({id,userId}:directoryIds) =>{
  const file = await getFileByIdQuery({id,userId})
  if(!file || file.length == 0){
    throw new ApiError("file is not found or already deleted",404,false)
  }
  console.log("file",file)
  
  let parentAncestorIds =  file[0].parent_id == null ? [] : [...file[0].ancestor_ids, file[0].dir_id];  

  let size = file[0].file_size
  console.log(parentAncestorIds,"---------")
  const result = await transaction(async (conn) => {
    const file = await deleteFileQuery(conn,{id,userId})
    const update = await updateAncestorDirectorySizeQuery(conn,parentAncestorIds, size, "subtract", userId)
    return [file,update]
  });
  return successResponse(result,"success fully deleted",201)
}