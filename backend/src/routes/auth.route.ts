import { Router } from "express";
import { sendOtp, userRegister,userLogin, replaceSession, logout, logoutFromAllDevice, logoutByAdmin, logoutFromAllDeviceByAdmin, listOfAllLoginUsers } from "../controllers/auth.controllers.js";
import { LoginUserSchema, sendOtpSchema, userRegisterSchema } from "../validations/auth.validations.js";
import { validate } from "../middlewares/validator/auth.validate.js";
import getClientIp from "../middlewares/modifier/getIp.middleware.js";
import { validateOtpSession } from "../middlewares/modifier/validateOtpSession.middleware.js";
import { validateChallengeSession } from "../middlewares/modifier/validateLoginChallenge.middleware.js";
import { validateAuthSession } from "../middlewares/modifier/verifyAuth.middleware.js";

const router = Router() 


router.post("/register",validate(userRegisterSchema), userRegister)

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Generate and send secure One-Time Password (OTP) and Token to the user's email and Web/Mobile respectively
 * @access  Public
 * @param req - Express request object containing the user's input data
 * @param res - Express response object used to send back HTTP status codes and data
 * @returns {Object} 200 - Success message if OTP is sent successfully
 * @returns {Object} 400 - Validation error (e.g., invalid email format)
 * @returns {Object} 500 - Internal server error (e.g., email service failure)
 */
router.post("/send-otp",validate(sendOtpSchema),sendOtp)



router.post("/login",validate(LoginUserSchema),userLogin)
router.post("/replace/session",validateChallengeSession,replaceSession)

router.post("/logout", validateAuthSession,logout);

router.post("/logout/all-devices", validateAuthSession, logoutFromAllDevice);

// super admin 

router.post("/admin/logout/session", logoutByAdmin);

router.post("/admin/logout/all-devices", logoutFromAllDeviceByAdmin);

router.get("/admin/logged-in-users", listOfAllLoginUsers);

export default router;