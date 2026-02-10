import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    // 2. Comprobar si el email ya está en uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Este email ya está registrado" });
    }
    // 3. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error: any) {
    console.error("Error en el registro:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("Intentando login con:", email);
    // 1. Buscar al usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 2. Comparar la contraseña enviada con el hash de la DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3. Generar el Token JWT
    // Usamos el ID del usuario y una clave secreta de tu .env
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "clave_secreta_temporal",
      { expiresIn: "7d" },
    );

    // 4. Responder con el token y datos básicos del usuario
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al intentar iniciar sesión" });
  }
};
