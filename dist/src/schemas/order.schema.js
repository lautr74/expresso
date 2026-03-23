import { z } from "zod";
export const createOrderSchema = z.object({
    addressId: z
        .uuid("El ID de la dirección debe ser un UUID válido")
        .min(1, "Debes seleccionar una dirección válida"),
});
