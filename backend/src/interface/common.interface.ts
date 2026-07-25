export interface Email {
  email:string
}

export interface Id {
  id:number
}

export interface UserId {
  userId:string
}

export interface SessionId {
  sessionId:string
}

export interface Ip {
  ip:string
}

export interface RoleId {
  roleId:string
}

export interface ParentId {
  parentId:number;
}

export interface IsDeleted {
  isDeleted:boolean;
}

export interface Status {
  Status:boolean;
}




export interface EmailParams {
  email: string;
};

export interface idParams {
  id:number
}

export interface userIdParams{
  userId:number
}

export interface clientIpParams {
  clientIp:string
}

export interface sessionIdParams {
  sessionId: string
}

export interface tokenParams {
  token:string
}

export interface roleIdParams {
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