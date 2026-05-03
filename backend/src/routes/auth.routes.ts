import { NextFunction, Request } from "express";

const sendOtp = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const { email,Ip } = req.body
        const response = await sendOtpService(email,ip)
        
        
    } catch (error) {
        next(error)
    }
}