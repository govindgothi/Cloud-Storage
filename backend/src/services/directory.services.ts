import { number } from "zod";
import { transaction } from "../db/postgresSql.js";
import { CreateDirectoryPayloadType, directoryIds, directoryNameIds, directoryParentId } from "../interface/directory.interface.js";
import {
  createDirectoryQuery,
  deleteAllChildrensAndCurrentDirectories,
  deleteDirectoryQuery,
  getAllDirectoriesByParentId,
  getDirectoryByIdQuery,
  updateAncestorDirectorySizeQuery,
  updateDirectoryNameQuery,
  updateParentDirectorySize
} from "../models/directory.models.js";
import { getAllAffectedFileDetail } from "../models/file.models.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { successResponse } from "../utils/responseHandler.js";

export const createDirectoryService = async ({
  userId,
  name,
  parentId,
}: CreateDirectoryPayloadType) => {
  const directory = parentId == null ? [] : await getDirectoryByIdQuery({ id: parentId, userId });
  if (directory.length == 0 && parentId != null) {
    throw new ApiError("Directory not found", 404, false);
  }
  let parent = directory[0];

  // 1. Get the base array (fallback to empty array if no parent exists)
  const baseAncestors = parent?.ancestor_ids || [];

  // 2. Only append parentId if it is a valid number/string (not null, undefined, or "")
  const ancestorIds = parentId ? [...baseAncestors, parentId] : baseAncestors;

  // 3. Create directory
  const dir = await createDirectoryQuery({
    userId,
    parentId,
    name: name,
    displayName: "Documents",
    ancestorIds: ancestorIds,
    depth: 0,
  });

  console.log("dir", dir);
  if (dir[0].id) {
    return successResponse(
      { id: dir[0].id },
      "directory created successfuly",
      201,
    );
  } else {
    throw new ApiError("Something went wrong", 400, false);
  }
};

export const getDirectoriesService = async ({userId,parentId}:directoryParentId)=>{
 const directory = await getAllDirectoriesByParentId({ parentId, userId });
 console.log("directory",directory)
  if (directory.length == 0 && parentId != null) {
    throw new ApiError("Directory not found", 404, false);
  }
  return successResponse(directory,"Directory data fetched success fully",200)
}

export const deleteDiretoriesService = async ({userId,id}:directoryIds) =>{
   const dir = await getDirectoryByIdQuery({id,userId})
   console.log("dir",dir)
   if(!dir || dir.length == 0){
    throw new ApiError("Directory not found",404,false)
   }
   // all set in parent dir of deleting directories
   let parentId = dir[0].parent_id
   const affectFileDetail = await getAllAffectedFileDetail({id:dir[0].id, userId})
   let {total_size,directory_ids} = affectFileDetail[0]
   let ids = directory_ids?.filter((id:number) => {id !== parentId})
   
   const {} = affectFileDetail
   const result = await transaction(async (conn) => {
     await  deleteAllChildrensAndCurrentDirectories(conn,ids,userId);
     await  updateParentDirectorySize(conn,parentId,userId,total_size)
   });

  return successResponse(id,"Directory deleted successfully",201)
}

export const updateDirectoryNameService = async ({userId,id,name}:directoryNameIds) =>{
  const dir = await getDirectoryByIdQuery({id,userId})
  if(!dir || dir.length == 0 || dir == null) {
     throw new ApiError("Direcotory not found",404,false)
  }
  const dirNameUpdate = await updateDirectoryNameQuery({userId,id,name})
  console.log("dirNameUpdate",dirNameUpdate)
  if(dirNameUpdate?.length>0){
   return successResponse({id,oldname:dir[0].name,newName:name},"Directory name success fuly updated")
  }else{
    throw new ApiError("Something went wrong",500,false)
  }
}

