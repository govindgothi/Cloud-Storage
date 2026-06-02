import { Router } from "express";
import { sendOtp, userRegister,userLogin, replaceSession } from "../controllers/auth.controllers.js";
import { LoginUserSchema, userRegisterSchema } from "../validations/auth.validations.js";
import { validate } from "../middlewares/validator/auth.validate.js";
import getClientIp from "../middlewares/modifier/getIp.middleware.js";
import { validateOtpSession } from "../middlewares/modifier/validateOtpSession.middleware.js";
import { validateChallengeSession } from "../middlewares/modifier/validateLoginChallenge.middleware.js";

const router = Router() 

router.post("/register",validateOtpSession,validate(userRegisterSchema), userRegister)
router.post("/send-otp",sendOtp)
router.post("/login",validate(LoginUserSchema),userLogin)
router.post("/replace/session",validateChallengeSession,replaceSession)

export default router;