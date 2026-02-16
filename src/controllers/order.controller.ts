import { type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import Stripe from "stripe";
import { OrderStatus } from "../../generated/prisma/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.body;
    const userId = req.user?.userId as string;

    // 1. Obtener el carrito
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { variant: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // --- NUEVO: Validar si hay stock suficiente antes de cobrar ---
    for (const item of cartItems) {
      if (item.variant.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente. Disponible: ${item.variant.stock}`,
        });
      }
    }

    // 2. Calcular el total
    const total = cartItems.reduce((acc, item) => {
      return acc + Number(item.variant.price) * item.quantity;
    }, 0);
    const amountInCents = Math.round(total * 100);

    // 3. TRANSACCIÓN
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          totalAmount: total,
          status: OrderStatus.PENDING,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
      });

      return newOrder;
    });

    // --- Cobrar con Stripe ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      payment_method_types: ["card"],
      metadata: {
        orderId: order.id,
        userId: userId,
      },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar el pedido" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as string;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
            variant: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener el historial de pedidos" });
  }
};
