import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateToken);

router.post("/", createOrder);

export default router;
