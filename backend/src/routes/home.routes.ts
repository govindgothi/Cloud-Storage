import { Router } from "express";
import { getHomePageData } from "../controllers/home.controllers.js";

const router = Router()

router.get("/home",getHomePageData)

export default router