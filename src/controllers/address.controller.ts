import { type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { type AuthRequest } from "../middlewares/auth.middleware.js";

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { title, street, city, state, zipCode, country, isDefault } =
      req.body;
    const userId = req.user?.userId as string;

    // Si esta va a ser la predeterminada, quitamos el default a las anteriores
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        title,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false,
        userId,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la dirección" });
  }
};

export const getMyAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as string;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener direcciones" });
  }
};
