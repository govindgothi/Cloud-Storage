import { Router } from "express";
import { sendOtp, userRegister } from "../controllers/auth.controllers.js";
import { userRegisterSchema } from "../validations/auth.validations.js";
import { validate } from "../middlewares/auth.validate.js";
import getClientIp from "../middlewares/getIp.middleware.js";

const router = Router() 

router.post("/",validate(userRegisterSchema), userRegister)
router.post("/send-otp",getClientIp,sendOtp)

export default router;