import express from "express";
import cors from "cors";
import "dotenv/config";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import { handleStripeWebhook } from "./controllers/webhook.controller.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

//Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Stripe Webhook
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    handleStripeWebhook(req, res);
  }
);

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`☕ Expresso API lista en: http://localhost:${PORT}`);
});
