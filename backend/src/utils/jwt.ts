import jwt, { SignOptions } from 'jsonwebtoken';
import { RolUsuario } from '@prisma/client';

interface JWTPayload {
  id: string;
  email: string;
  rol: RolUsuario;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '24h') as SignOptions['expiresIn'],
  };
  
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  
  const decoded = jwt.verify(token, secret);
  return decoded as JWTPayload;
};