import { NextFunction, Request, Response } from "express";

export const getHomePageData = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        return res.status(200).json("ok")
    } catch (error) {
        next(error)
    }
}