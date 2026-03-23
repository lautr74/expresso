import { type Response } from "express";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { type AuthRequest } from "../middlewares/auth.middleware.js";

const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY no está configurada");
  }

  return new Stripe(stripeSecretKey);
};

export const createSubscriptionIntent = async (
  req: AuthRequest,
  res: Response,
) => {
  const { productId, variantId, plan, priceId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  if (typeof priceId !== "string" || !priceId) {
    return res.status(400).json({ error: "priceId es obligatorio" });
  }

  try {
    const stripe = getStripeClient();

    // 1. Buscamos al usuario en nuestra DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Gestionar el Customer de Stripe
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      // Guardamos el ID de cliente de Stripe en nuestro User
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // 3. Crear la Suscripción en Stripe (modo incompleto hasta que se pague)
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }], // El priceId viene de tu Dashboard de Stripe
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.confirmation_secret"],
      metadata: {
        userId,
        productId: typeof productId === "string" ? productId : null,
        variantId: typeof variantId === "string" ? variantId : null,
        plan: typeof plan === "string" ? plan : null,
      },
    });

    // 4. Enviamos el clientSecret al frontend
    const invoice = subscription.latest_invoice;
    if (!invoice || typeof invoice === "string") {
      return res
        .status(500)
        .json({ error: "Stripe no devolvió la factura de la suscripción" });
    }

    const clientSecret = invoice.confirmation_secret?.client_secret;
    if (!clientSecret) {
      return res.status(500).json({
        error: "Stripe no devolvió el client secret de la suscripción",
      });
    }

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("❌ Error en Subscription Controller:", message);
    res.status(500).json({ error: "No se pudo iniciar la suscripción" });
  }
};

export const getUserSubscriptions = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        product: true,
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener suscripciones" });
  }
};
