import { type Request, type Response } from "express";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { OrderStatus } from "../../generated/prisma/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log("📥 Petición recibida en Webhook /api/webhooks/stripe");

    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`❌ Error de firma: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 Evento de Stripe recibido: ${event.type}`);

    // Respondemos 200 YA para evitar que Stripe lo reintente infinitamente si algo falla.
    res.json({ received: true });

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, addressId } = paymentIntent.metadata;

        console.log("💰 Pago de Stripe exitoso. Metadata:", { userId, addressId });

        try {
            await prisma.$transaction(async (tx) => {
                const cartItems = await tx.cartItem.findMany({
                    where: { userId },
                    include: { variant: true },
                });

                if (cartItems.length === 0) {
                    console.log("ℹ️ Carrito vacío, nada que hacer.");
                    return;
                }
                console.log("creando orden");

                const order = await tx.order.create({
                    data: {
                        userId,
                        addressId,
                        totalAmount: paymentIntent.amount / 100,
                        status: OrderStatus.PAID,
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

                for (const item of cartItems) {
                    await tx.variant.update({
                        where: { id: item.variantId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                await tx.cartItem.deleteMany({ where: { userId } });
                console.log(`✅ ORDEN CREADA: ${order.id}`);
            }, {
                timeout: 10000 // 10 segundos máximo para la transacción
            });
        } catch (error) {
            console.error("❌ ERROR EN TRANSACCIÓN:", error);
        }
    }
};