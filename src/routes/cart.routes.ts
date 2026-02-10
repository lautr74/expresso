import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getMyCart,
  removeFromCart,
  decreaseQuantity,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getMyCart);
router.post("/add", addToCart);
router.delete("/:variantId", removeFromCart);
router.post("/decrease", decreaseQuantity);

export default router;
