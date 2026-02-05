import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
} from "../controllers/product.controller.js";

const router = Router();

// Definimos que el GET a la raíz de este router llame a getProducts
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
