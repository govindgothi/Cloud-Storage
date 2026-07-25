import { userIdParams } from "./common.interface.js";

export interface CreateFileDto {
  parentId: number | null;
  userId: number;
  filename: string;
  type:string;
  size:number;
  lastModified:number;
  lastModifiedDate:Date;
}

export interface CreateFileInput extends CreateFileDto,userIdParams {

}

export interface CreateFileParams extends CreateFileInput {
  originalFilename:string,
  extension:string | null,
  parentAncestorIds: string[] | null
}
