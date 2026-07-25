import { deletedParams, idParams, nameParams, parentIdParams, statusParams, userIdParams } from "./common.interface.js";

export type CreateDirectoryPayloadType = userIdParams & parentIdParams & nameParams & {}

export type CreateDirectoryQueryPayloadType = CreateDirectoryPayloadType & {
  displayName?: string | null;
  ancestorIds: number[];
  depth: number;
}

export interface directoryIds extends idParams , userIdParams , statusParams  , deletedParams  {}

export type directoryParentId = parentIdParams & userIdParams & statusParams  & deletedParams & {}

export type directoryNameIds = idParams & userIdParams & statusParams  & deletedParams & {
  name:string
}
