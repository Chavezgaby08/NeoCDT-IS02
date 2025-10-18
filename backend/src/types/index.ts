import { Request } from 'express';
import { RolUsuario, EstadoSolicitud } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    rol: RolUsuario;
  };
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    rol: RolUsuario;
  };
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface SolicitudDTO {
  id: string;
  monto: number;
  plazo: number;
  tasaInteres: number;
  estado: EstadoSolicitud;
  fechaCreacion: Date;
  clienteId: string;
}