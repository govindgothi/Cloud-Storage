import { NextFunction, Request, Response } from "express";
import { createFileService, deleteFileService } from "../services/file.services.js";
import { CreateFileDto } from "../interface/file.interface.js";

export const createFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      parentId,
      filename,
      type,
      size,
      lastModified,
      lastModifiedDate,
    }: CreateFileDto = req.body;

    let userId  = Number(req.user.userId)
    const response = await createFileService({
      parentId,
      userId,
      filename,
      type,
      size,
      lastModified,
      lastModifiedDate
    });
    if (response.success) {
      const { statusCode, message, data, success } = response;
      return res.status(statusCode).json({ message, data, success });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFile = async(req:Request,res:Response,next:NextFunction)=>{

}

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user.userId);
    const response = await deleteFileService({ id, userId });
    if (response?.success) {
      return res.status(response.statusCode).json(response);
    } else {
      return res
        .status(500)
        .json({ message: "something went wrong", success: false });
    }
  } catch (err) {
    console.log(err)
    next(err)
  }
};
