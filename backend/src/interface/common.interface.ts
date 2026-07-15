export type EmailParams = {
  email: string;
};

export type idParams = {
  id:number
}

export type userIdParams ={
  userId:number
}

export type clientIpParams = {
  clientIp:string
}

export type sessionIdParams = {
  sessionId: string
}

export type tokenParams = {
  token:string
}

export type roleIdParams = {
   roleId:number
}


// direcotries interface
export interface parentIdParams {
  parentId: number | null;
}

export interface nameParams {
  name:string;
}

export interface deletedParams {
  is_deleted?:boolean
}

export interface statusParams {
  is_status?:boolean
}