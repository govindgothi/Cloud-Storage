import { Response } from "express";
import { HttpMessage, HttpStatus } from "../constant/globle.js";


export const successResponse = <T>(
  res: Response,
  data: T,
  message = HttpMessage.OK,
  statusCode:number = HttpStatus.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};