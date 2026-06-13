import { Router } from "express";
import { getRolesStoredInRedis, syncRolesToRedis } from "../controllers/maintenance.controllers.js";

const router = Router()

router.post('/sync-roles-to-redis',syncRolesToRedis)
router.get('/get-roles-stored-in-redis',getRolesStoredInRedis)
export default router;