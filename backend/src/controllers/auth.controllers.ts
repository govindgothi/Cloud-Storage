import { NextFunction, Request, Response } from "express";
import { sendOtpService, userRegisterService } from "../services/auth.services.js";
import { successResponse } from "../utils/responseHandler.js";

export const userRegister = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const data = req.body
    const response = await userRegisterService(data)
    if(response?.success){
        const {id,statusCode,message} = response
        return res.status(response.statusCode).json(successResponse(id,message,statusCode))
    }
} catch (error) {
    console.log(error,"ertt")
    next(error)
}
}



export const sendOtp = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const payloads = req.body
    const response = await sendOtpService(payloads)
  } catch (error) {
    next(error)
  }
}