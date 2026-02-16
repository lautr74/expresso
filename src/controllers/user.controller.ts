import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user?.userId as string;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron datos para actualizar" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
