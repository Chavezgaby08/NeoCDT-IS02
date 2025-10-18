import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors?.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })) || [],
      });
    }
  };
};
