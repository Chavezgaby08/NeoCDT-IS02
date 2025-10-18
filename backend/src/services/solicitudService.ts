  import prisma from '../config/database';
  import { CreateSolicitudInput, UpdateSolicitudInput } from '../validators/solicitudValidator';
  import { Prisma } from '@prisma/client';

  export class SolicitudService {
    async getSolicitudes(usuarioId: string) {
      const cliente = await prisma.cliente.findUnique({
        where: { usuarioId },
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const solicitudes = await prisma.solicitudCDT.findMany({
        where: { clienteId: cliente.id },
        orderBy: { createdAt: 'desc' },
      });

      return solicitudes;
    }

    async getSolicitudById(id: string, usuarioId: string) {
      const cliente = await prisma.cliente.findUnique({
        where: { usuarioId },
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const solicitud = await prisma.solicitudCDT.findFirst({
        where: {
          id,
          clienteId: cliente.id,
        },
      });

      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      return solicitud;
    }

    async createSolicitud(data: CreateSolicitudInput, usuarioId: string) {
      const cliente = await prisma.cliente.findUnique({
        where: { usuarioId },
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const solicitud = await prisma.solicitudCDT.create({
        data: {
          clienteId: cliente.id,
          monto: data.monto,
          plazoMeses: data.plazoMeses,
          tasaInteres: data.tasaInteres,
          estado: 'BORRADOR',
        },
      });

      await prisma.historialEstado.create({
        data: {
          solicitudId: solicitud.id,
          estadoNuevo: 'BORRADOR',
          observaciones: 'Solicitud creada',
          cambiadoPor: usuarioId,
        },
      });

      return solicitud;
    }

    async updateSolicitud(id: string, data: UpdateSolicitudInput, usuarioId: string) {
      const cliente = await prisma.cliente.findUnique({
        where: { usuarioId },
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const solicitudExistente = await prisma.solicitudCDT.findFirst({
        where: {
          id,
          clienteId: cliente.id,
        },
      });

      if (!solicitudExistente) {
        throw new Error('Solicitud no encontrada');
      }

    //  if (solicitudExistente.estado !== 'BORRADOR' && data.estado === undefined) {
    //    throw new Error('Solo se pueden editar solicitudes en estado BORRADOR');
    //  }

      // Construir el objeto de actualización correctamente
      const updateData: Prisma.SolicitudCDTUpdateInput = {};

      if (data.monto !== undefined) {
        updateData.monto = data.monto;
      }

      if (data.plazoMeses !== undefined) {
        updateData.plazoMeses = data.plazoMeses;
      }

      if (data.tasaInteres !== undefined) {
        updateData.tasaInteres = data.tasaInteres;
      }

      if (data.estado !== undefined) {
        updateData.estado = data.estado;
        
        // Si se aprueba, agregar fecha de apertura
        if (data.estado === 'APROBADA' && solicitudExistente.estado !== 'APROBADA') {
          updateData.fechaApertura = new Date();
        }
      }

      if (data.motivoRechazo !== undefined) {
        updateData.motivoRechazo = data.motivoRechazo;
      }

      const solicitudActualizada = await prisma.solicitudCDT.update({
        where: { id },
        data: updateData,
      });

      // Si cambió el estado, registrar en historial
      if (data.estado && data.estado !== solicitudExistente.estado) {
        await prisma.historialEstado.create({
          data: {
            solicitudId: id,
            estadoAnterior: solicitudExistente.estado,
            estadoNuevo: data.estado,
            observaciones: data.motivoRechazo || 'Estado actualizado',
            cambiadoPor: usuarioId,
          },
        });
      }

      return solicitudActualizada;
    }

    async deleteSolicitud(id: string, usuarioId: string) {
      const cliente = await prisma.cliente.findUnique({
        where: { usuarioId },
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const solicitud = await prisma.solicitudCDT.findFirst({
        where: {
          id,
          clienteId: cliente.id,
        },
      });

      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

     // if (solicitud.estado !== 'BORRADOR') {
     //   throw new Error('Solo se pueden eliminar solicitudes en estado BORRADOR');
     // }

      await prisma.solicitudCDT.delete({
        where: { id },
      });

      return { success: true, message: 'Solicitud eliminada' };
    }
  }