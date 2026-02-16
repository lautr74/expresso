import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(20, "El nombre no puede tener más de 20 caracteres")
    .refine((val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), {
      message: "El nombre solo puede contener letras y espacios",
    }),
  email: z
    .email("Formato de email inválido")
    .refine((val) => /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(val), {
      message: "El email debe tener un dominio válido",
    })
    .refine(
      (val) => !/(tempmail|mailinator|10minutemail|guerrillamail)/i.test(val),
      {
        message: "No se permiten emails temporales",
      },
    ),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede tener más de 32 caracteres")
    .refine((val) => /[A-Z]/.test(val), {
      message: "La contraseña debe contener al menos una letra mayúscula",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "La contraseña debe contener al menos una letra minúscula",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "La contraseña debe contener al menos un número",
    }),
});

export const loginSchema = z.object({
  email: z.email("Formato de email inválido"),
  password: z.string(),
});
