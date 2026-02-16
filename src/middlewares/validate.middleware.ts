import { type Request, type Response, type NextFunction } from "express";
import { type ZodType, ZodError } from "zod";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // parse() valida y devuelve el payload saneado (strip/transform)
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
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
