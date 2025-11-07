import { z } from 'zod';
import { EstadoSolicitud } from '@prisma/client';

// ✅ CORRECCIÓN: tasaInteres es OPCIONAL al crear (la asigna el asesor al aprobar)
export const createSolicitudSchema = z.object({
  monto: z.number().positive('El monto debe ser positivo').min(100000, 'Monto mínimo: 100,000'),
  plazoMeses: z.number().int().positive().min(1).max(60, 'Plazo máximo: 60 meses'),
  // ⬇️ tasaInteres ahora es OPCIONAL
  tasaInteres: z.number().positive().min(0.1).max(20).optional(),
});

export const updateSolicitudSchema = z.object({
  monto: z.number().positive().min(100000).optional(),
  plazoMeses: z.number().int().positive().min(1).max(60).optional(),
  tasaInteres: z.number().positive().min(0.1).max(20).optional(),
  estado: z.nativeEnum(EstadoSolicitud).optional(),
  motivoRechazo: z.string().optional(),
});

export type CreateSolicitudInput = z.infer<typeof createSolicitudSchema>;
export type UpdateSolicitudInput = z.infer<typeof updateSolicitudSchema>;