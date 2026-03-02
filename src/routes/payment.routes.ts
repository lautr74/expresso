import { Router } from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, createPaymentIntent);

export default router;