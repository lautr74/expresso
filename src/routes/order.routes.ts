import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();
router.use(authenticateToken);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/orders", getMyOrders);

export default router;
