import express from "express";
import cors from "cors";
import "dotenv/config";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Para que tu React pueda consultar la API sin bloqueos
app.use(express.json());

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`☕ Expresso API lista en: http://localhost:${PORT}`);
});
