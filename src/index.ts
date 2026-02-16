import express from "express";
import cors from "cors";
import "dotenv/config";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import { handleStripeWebhook } from "./controllers/webhook.controller.js";

const app = express();
const PORT = process.env.PORT || 3001;

//Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Stripe Webhook (antes de middlewares para que no intente parsear el body)
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
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

app.listen(PORT, () => {
  console.log(`☕ Expresso API lista en: http://localhost:${PORT}`);
});
