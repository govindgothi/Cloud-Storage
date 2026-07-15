import { NextFunction, Request, Response } from "express";
import {
  createDirectoryService,
  deleteDiretoriesService,
  getDirectoriesService,
  updateDirectoryNameService
} from "../services/directory.services.js";
import { success } from "zod";

export const createDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.user.userId);
    const { name, parentId } = req.body;
    const response = await createDirectoryService({ userId, name, parentId });
    if (response.success) {
      const { data, message, statusCode, success } = response;
      return res.status(statusCode).json({ message, data, success });
    } else {
      return res
        .status(501)
        .json({ message: "Something went wrong", success: false, data: null });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getDirectoriesByParentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { parentId } = req.body;
    const userId = Number(req.user.userId);
    const response = await getDirectoriesService({ parentId, userId });
    if (response.success) {
      const { data, message, statusCode, success } = response;
      return res.status(statusCode).json({ message, data, success });
    } else {
      return res
        .status(501)
        .json({ message: "Something went wrong", success: false, data: null });
    }
  } catch (error) {
     console.log(error);
    next(error);
  }
};

export const updateDirectoryName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   let id = Number(req.params.id);
   const userId = Number(req.user.userId);
   const name = req.body?.name
   const response = await updateDirectoryNameService({id,userId,name})
   if(response.success){
    const {statusCode,success,data,message} = response
    return res.status(statusCode).json({message,data,success})
   }
  } catch (error) {
    console.log(error)
    next(error)
  }
};

export const deleteDirectories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let id = Number(req.params.id);
    const userId = Number(req.user.userId);
    const response = await deleteDiretoriesService({userId,id})
    if(response.success){
     return res.status(response.statusCode).json(response)
    }
  } catch (error) {
    console.log(error)
     next(error)
  }
};

export const protectDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {}
};

export const unprotectDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {}
};
