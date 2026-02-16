import Stripe from "stripe";
import { type Response } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error al crear la intención de pago:", error);
    res.status(500).json({ error: "Error al crear la intención de pago" });
  }
};
