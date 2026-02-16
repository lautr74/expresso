import Router from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { updateUser } from "../controllers/user.controller.js";

const router = Router();
router.use(authenticateToken);

router.post("/update", updateUser);

export default router;
