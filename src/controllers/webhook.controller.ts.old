import { type Request, type Response } from "express";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { OrderStatus } from "../../generated/prisma/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    // Verificamos que la petición viene realmente de Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Error de firma: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Si el pago ha sido exitoso:
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { userId, addressId } = paymentIntent.metadata;

    console.log(`💰 Pago recibido de ${userId}`);

    try {
      // 1. Buscamos el pedido pendiente de este usuario (el más reciente)
      const order = await prisma.order.findFirst({
        where: { userId, status: OrderStatus.PENDING },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      if (order) {
        await prisma.$transaction(async (tx) => {
          // A. Cambiar estado a PAGADO
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.PAID },
          });

          // B. Restar stock del inventario
          for (const item of order.items) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }

          // C. Vaciar el carrito
          await tx.cartItem.deleteMany({
            where: { userId },
          });
        });

        console.log(`✅ Pedido ${order.id} completado con éxito`);
      }
    } catch (error) {
      console.error("Error procesando pago:", error);
      return res
        .status(500)
        .json({ error: "Error interno procesando el webhook" });
    }
  }

  res.json({ received: true });
};
