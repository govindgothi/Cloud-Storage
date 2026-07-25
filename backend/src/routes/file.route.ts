import { Router } from "express";
import { createFile, deleteFile, getFile } from "../controllers/file.controllers.js";
import { validate } from "../middlewares/validator/auth.validate.js";
import { fileSchema } from "../validations/file.validations.js";
import { validateAuthSession } from "../middlewares/modifier/verifyAuth.middleware.js";

const router = Router()

router.post("/",validateAuthSession, validate(fileSchema), createFile)
router.get("/",getFile)
router.delete("/:id",validateAuthSession,deleteFile)

export default router;