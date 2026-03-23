import {} from "express";
import { ZodError } from "zod";
export const validate = (schema) => (req, res, next) => {
    try {
        // parse() valida y devuelve el payload saneado (strip/transform)
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: "Error de validación",
                details: error.issues.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};
