import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.uuid("El formato del ID del producto no es válido"),
  variantId: z.uuid("El formato del ID de la variante no es válido"),
  quantity: z
    .number("La cantidad debe ser un número")
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0")
    .max(10, "No puedes añadir más de 10 unidades de este producto a la vez"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
