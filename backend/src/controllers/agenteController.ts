import { Response } from 'express';
import { AuthRequest } from '../types';
import { AgenteService } from '../services/agenteService';

const agenteService = new AgenteService();

export class AgenteController {
    // Obtener TODAS las solicitudes (para el dashboard del agente)
    async getAllSolicitudes(req: AuthRequest, res: Response) {
        try {
            const { estado, page = 1, limit = 50 } = req.query;

            const solicitudes = await agenteService.getAllSolicitudes({
                estado: estado as string | undefined,
                page: Number(page),
                limit: Number(limit),
            });

            res.status(200).json(solicitudes);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al obtener solicitudes',
            });
        }
    }

    // Obtener estadísticas para el dashboard del agente
    async getEstadisticas(_req: AuthRequest, res: Response) {
        try {
            const estadisticas = await agenteService.getEstadisticas();
            res.status(200).json(estadisticas);
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al obtener estadísticas',
            });
        }
    }

    // Aprobar una solicitud
    async aprobarSolicitud(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { tasaInteres, observaciones } = req.body;

            const solicitud = await agenteService.aprobarSolicitud(
                id,
                req.user!.id,
                tasaInteres,
                observaciones
            );

            res.status(200).json({
                success: true,
                message: 'Solicitud aprobada exitosamente',
                data: solicitud,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al aprobar solicitud',
            });
        }
    }

    // Rechazar una solicitud
    async rechazarSolicitud(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { motivoRechazo } = req.body;

            if (!motivoRechazo || motivoRechazo.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'El motivo de rechazo es obligatorio',
                });
                return;
            }

            const solicitud = await agenteService.rechazarSolicitud(
                id,
                req.user!.id,
                motivoRechazo
            );

            res.status(200).json({
                success: true,
                message: 'Solicitud rechazada',
                data: solicitud,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al rechazar solicitud',
            });
        }
    }

    // Obtener solicitud por ID (sin restricción de cliente)
    async getSolicitudById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const solicitud = await agenteService.getSolicitudById(id);
            res.status(200).json(solicitud);
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || 'Solicitud no encontrada',
            });
        }
    }

    // Obtener historial de una solicitud
    async getHistorialSolicitud(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const historial = await agenteService.getHistorialSolicitud(id);
            res.status(200).json(historial);
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || 'Error al obtener historial',
            });
        }
    }
}