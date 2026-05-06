import { email } from "zod";
import { registerQuery } from "../models/auth.models.js";
import { getUsersDetailByEmail } from "../models/common.models.js";
import { ApiError } from "../utils/errorHandler.utils.js";
import { getProfileUrl } from "../utils/getProfileUrl.utils.js";
import { UserRegisterInput } from "../validations/auth.validations.js";

export const userRegisterService = async(data:UserRegisterInput)=>{
  const {username, email,password,otp} = data
  const profileUrl =  getProfileUrl(username)
  console.log(profileUrl)
  const fields = ["id","email"]
  const isUser = await getUsersDetailByEmail({fields,email})
  console.log("isUser",isUser)
  if(isUser && isUser.length){
     throw new ApiError("This Email is already exists",403,false)
  }
  const userStore = await registerQuery(username,email,password,profileUrl)
  if(userStore.affectedRow == 1 && userStore.insertedId){
    return {
        id:userStore.insertedId,
        statusCode:201,
        success:true,
        message:"user successfuly inserted"
    }
  }
}

export const sendOtpService  = async({email,clientIp}:{email:string,clientIp:string})=>{
console.log(email,clientIp)


}