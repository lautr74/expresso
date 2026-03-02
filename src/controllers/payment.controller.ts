import Stripe from "stripe";
import { type Response } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../../lib/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// backend/src/controllers/payment.controller.ts

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { addressId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Calculamos el total REAL desde tu base de datos
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { variant: true }
    });

    const totalAmount = cartItems.reduce((acc, item) =>
      acc + (Number(item.variant.price) * item.quantity), 0
    );

    if (totalAmount <= 0) return res.status(400).json({ error: "Carrito vacío" });

    // 2. Creamos el Payment Intent con el valor REAL
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe usa céntimos
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId,
        addressId: addressId
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
};
