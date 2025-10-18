import { Response } from 'express';
import { AuthRequest } from '../types';
import { SolicitudService } from '../services/solicitudService';

const solicitudService = new SolicitudService();

export class SolicitudController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const solicitudes = await solicitudService.getSolicitudes(req.user!.id);
      res.status(200).json(solicitudes);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener solicitudes',
      });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const solicitud = await solicitudService.getSolicitudById(req.params.id, req.user!.id);
      res.status(200).json(solicitud);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Solicitud no encontrada',
      });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const solicitud = await solicitudService.createSolicitud(req.body, req.user!.id);
      res.status(201).json(solicitud);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear solicitud',
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const solicitud = await solicitudService.updateSolicitud(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.status(200).json(solicitud);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar solicitud',
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await solicitudService.deleteSolicitud(req.params.id, req.user!.id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar solicitud',
      });
    }
  }
}