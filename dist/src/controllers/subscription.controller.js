import {} from "express";
import { prisma } from "../../lib/prisma.js";
import {} from "../middlewares/auth.middleware.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createSubscriptionIntent = async (req, res) => {
    const { productId, variantId, plan, priceId } = req.body;
    const userId = req.user?.userId;
    try {
        // 1. Buscamos al usuario en nuestra DB
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
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
            expand: ["latest_invoice.payment_intent"],
            metadata: {
                userId,
                productId, // El café específico
                variantId, // El tamaño/formato
                plan, // MONTHLY o QUARTERLY
            },
        });
        // 4. Enviamos el clientSecret al frontend
        const invoice = subscription.latest_invoice;
        const paymentIntent = invoice.payment_intent;
        res.status(200).json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        console.error("❌ Error en Subscription Controller:", error.message);
        res.status(500).json({ error: "No se pudo iniciar la suscripción" });
    }
};
export const getUserSubscriptions = async (req, res) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: req.user.id },
            include: {
                product: true,
                variant: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(subscriptions);
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener suscripciones" });
    }
};
