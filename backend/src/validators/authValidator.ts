import { z } from 'zod';

export const registerSchema = z.object({
  nombreCompleto: z.string().min(3, 'Nombre completo debe tener al menos 3 caracteres'),
  username: z.string().min(3, 'Username debe tener al menos 3 caracteres'),
  cedula: z.string().min(6, 'Cédula debe tener al menos 6 caracteres'),
  correo: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'Teléfono debe tener al menos 10 caracteres'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username es requerido'),
  password: z.string().min(1, 'Password es requerido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;