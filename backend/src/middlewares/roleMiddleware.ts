import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { RolUsuario } from '@prisma/client';

export const requireRole = (...allowedRoles: RolUsuario[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
            return;
        }

        if (!allowedRoles.includes(req.user.rol)) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción',
            });
            return;
        }

        next();
    };
};