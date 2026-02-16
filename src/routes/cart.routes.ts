import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getMyCart,
  removeFromCart,
  decreaseQuantity,
} from "../controllers/cart.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addToCartSchema } from "../schemas/cart.schema.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getMyCart);
router.post("/add", validate(addToCartSchema), addToCart);
router.delete("/:variantId", removeFromCart);
router.post("/decrease", decreaseQuantity);

export default router;
