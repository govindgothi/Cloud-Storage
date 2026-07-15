import { Router } from "express";
import { createDirectory, deleteDirectories, getDirectoriesByParentId, updateDirectoryName } from "../controllers/directory.controllers.js";
import { validateAuthSession } from "../middlewares/modifier/verifyAuth.middleware.js";
import { directorySchema, getAllDirectorySchema } from "../validations/directory.validation.js";
import { validate } from "../middlewares/validator/auth.validate.js";


const router = Router() 

router.post("/", validateAuthSession, validate(directorySchema), createDirectory)
router.get("/", validateAuthSession, validate(getAllDirectorySchema), getDirectoriesByParentId)
router.delete("/:id",validateAuthSession, deleteDirectories)
router.patch("/:id",validateAuthSession, updateDirectoryName)
export default router;