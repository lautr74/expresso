import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { origin, sort } = req.query;

    const whereClause = origin ? { origin: String(origin) } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { variants: true },
    });

    if (sort === "price_asc" || sort === "price_desc") {
      products.sort((a, b) => {
        const priceA = Number(a.variants[0]?.price) || 0;
        const priceB = Number(b.variants[0]?.price) || 0;
        return sort === "price_asc" ? priceA - priceB : priceB - priceA;
      });
    }
    res.json(products);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({
      error: "Error al obtener productos",
      message: error.message,
    });
  }
};
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug: String(slug).toLowerCase() },
      include: { variants: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Café no encontrado" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};
