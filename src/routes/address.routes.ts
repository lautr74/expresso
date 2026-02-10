import { Router } from "express";
import {
  createAddress,
  getMyAddresses,
} from "../controllers/address.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post("/", createAddress);
router.get("/", getMyAddresses);

export default router;
