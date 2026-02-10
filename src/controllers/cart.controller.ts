import { type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { type AuthRequest } from "../middlewares/auth.middleware.js";

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user?.userId;

    // 1. VALIDACIÓN DE PERTENENCIA
    const variantCheck = await prisma.variant.findFirst({
      where: {
        id: variantId,
        productId: productId,
      },
    });
    if (!variantCheck) {
      return res.status(400).json({
        error: "La variante seleccionada no pertenece a este producto.",
      });
    }

    // 2. VALIDACIÓN DE STOCK
    if (variantCheck.stock < quantity) {
      return res.status(400).json({
        error: `Solo quedan ${variantCheck.stock} unidades disponibles.`,
      });
    }

    if (!userId)
      return res.status(401).json({ error: "Usuario no identificado" });

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
      update: {
        quantity: { increment: quantity || 1 },
      },
      create: {
        userId,
        productId,
        variantId,
        quantity: quantity || 1,
      },
    });

    res.status(201).json({ message: "Carrito actualizado", cartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al añadir al carrito" });
  }
};

export const getMyCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Buscamos todos los items del carrito de ESTE usuario
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
      include: {
        product: {
          select: {
            name: true,
            description: true,
            imageUrl: true,
            origin: true,
            slug: true,
          },
        },
        // Traemos la información de la variante (precio, peso, etc.)
        variant: {
          select: {
            price: true,
            weight: true,
            stock: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(cartItems);
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const variantId = req.params.variantId as string;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Eliminamos el ítem usando la clave única que definimos en el schema
    await prisma.cartItem.delete({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

    res.json({ message: "Producto eliminado del carrito" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "El producto no estaba en el carrito" });
    }

    console.error("Error al eliminar del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const decreaseQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const { variantId } = req.body;
    const userId = req.user?.userId as string;

    // 1. Buscamos si el producto existe en el carrito
    const currentItem = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: { userId, variantId },
      },
    });

    if (!currentItem) {
      return res
        .status(404)
        .json({ error: "El producto no está en el carrito" });
    }

    // 2. Si solo queda 1 unidad, lo eliminamos por completo
    if (currentItem.quantity <= 1) {
      await prisma.cartItem.delete({
        where: {
          userId_variantId: { userId, variantId },
        },
      });
      return res.json({
        message: "Producto eliminado del carrito",
        quantity: 0,
      });
    }

    // 3. Si hay más de 1, restamos una unidad
    const updatedItem = await prisma.cartItem.update({
      where: {
        userId_variantId: { userId, variantId },
      },
      data: {
        quantity: { decrement: 1 },
      },
    });

    res.json({ message: "Unidad restada", updatedItem });
  } catch (error) {
    console.error("Error al restar cantidad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
