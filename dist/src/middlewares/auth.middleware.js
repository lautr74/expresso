import {} from "express";
import jwt from "jsonwebtoken";
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ error: "Acceso denegado. Token no proporcionado." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 3. Inyectar los datos del usuario en el objeto request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };
        // 4. Continuar al siguiente paso (el controlador)
        next();
    }
    catch (error) {
        return res.status(403).json({ error: "Token no válido o expirado." });
    }
};
