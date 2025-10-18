import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterInput, LoginInput } from '../validators/authValidator';

const authService = new AuthService();

export class AuthController {
  async register(req: Request<{}, {}, RegisterInput>, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar usuario',
      });
    }
  }

  async login(req: Request<{}, {}, LoginInput>, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Error al iniciar sesión',
      });
    }
  }
}