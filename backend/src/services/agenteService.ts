import prisma from '../config/database';
import { EstadoSolicitud } from '@prisma/client';

export class AgenteService {
    // Obtener todas las solicitudes (con filtros opcionales)
    async getAllSolicitudes(filters: {
        estado?: string;
        page?: number;
        limit?: number;
    }) {
        const { estado, page = 1, limit = 50 } = filters;

        const where: any = {};

        if (estado && estado !== 'TODOS') {
            where.estado = estado as EstadoSolicitud;
        }

        const solicitudes = await prisma.solicitudCDT.findMany({
            where,
            include: {
                cliente: {
                    select: {
                        nombres: true,
                        apellidos: true,
                        numeroDocumento: true,
                        telefono: true,
                        usuario: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
        });

        const total = await prisma.solicitudCDT.count({ where });

        return {
            solicitudes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Obtener estadísticas para el dashboard
    async getEstadisticas() {
        const [
            totalSolicitudes,
            enValidacion,
            aprobadasHoy,
            rechazadasHoy,
            montoTotalValidacion,
        ] = await Promise.all([
            // Total de solicitudes
            prisma.solicitudCDT.count(),

            // Solicitudes en validación
            prisma.solicitudCDT.count({
                where: { estado: 'EN_VALIDACION' },
            }),

            // Aprobadas hoy
            prisma.solicitudCDT.count({
                where: {
                    estado: 'APROBADA',
                    updatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),

            // Rechazadas hoy
            prisma.solicitudCDT.count({
                where: {
                    estado: 'RECHAZADA',
                    updatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),

            // Monto total en validación
            prisma.solicitudCDT.aggregate({
                where: { estado: 'EN_VALIDACION' },
                _sum: { monto: true },
            }),
        ]);

        return {
            totalSolicitudes,
            enValidacion,
            aprobadasHoy,
            rechazadasHoy,
            montoTotalValidacion: montoTotalValidacion._sum.monto || 0,
        };
    }

    // Aprobar solicitud
    async aprobarSolicitud(
        solicitudId: string,
        agenteId: string,
        tasaInteres?: number,
        observaciones?: string
    ) {
        // Verificar que la solicitud existe
        const solicitud = await prisma.solicitudCDT.findUnique({
            where: { id: solicitudId },
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== 'EN_VALIDACION') {
            throw new Error(
                'Solo se pueden aprobar solicitudes en estado EN_VALIDACION'
            );
        }

        const fechaApertura = new Date();
        const fechaVencimiento = new Date(fechaApertura);
        fechaVencimiento.setMonth(
            fechaVencimiento.getMonth() + solicitud.plazoMeses
        );

        // Actualizar solicitud
        const solicitudActualizada = await prisma.solicitudCDT.update({
            where: { id: solicitudId },
            data: {
                estado: 'APROBADA',
                tasaInteres: tasaInteres || solicitud.tasaInteres,
                fechaApertura,
                fechaVencimiento,
            },
        });

        // Registrar en historial
        await prisma.historialEstado.create({
            data: {
                solicitudId,
                estadoAnterior: 'EN_VALIDACION',
                estadoNuevo: 'APROBADA',
                observaciones: observaciones || 'Solicitud aprobada por el agente',
                cambiadoPor: agenteId,
            },
        });

        return solicitudActualizada;
    }

    // Rechazar solicitud
    async rechazarSolicitud(
        solicitudId: string,
        agenteId: string,
        motivoRechazo: string
    ) {
        // Verificar que la solicitud existe
        const solicitud = await prisma.solicitudCDT.findUnique({
            where: { id: solicitudId },
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        if (solicitud.estado !== 'EN_VALIDACION') {
            throw new Error(
                'Solo se pueden rechazar solicitudes en estado EN_VALIDACION'
            );
        }

        // Actualizar solicitud
        const solicitudActualizada = await prisma.solicitudCDT.update({
            where: { id: solicitudId },
            data: {
                estado: 'RECHAZADA',
                motivoRechazo,
            },
        });

        // Registrar en historial
        await prisma.historialEstado.create({
            data: {
                solicitudId,
                estadoAnterior: 'EN_VALIDACION',
                estadoNuevo: 'RECHAZADA',
                observaciones: motivoRechazo,
                cambiadoPor: agenteId,
            },
        });

        return solicitudActualizada;
    }

    // Obtener solicitud por ID (sin restricción de cliente)
    async getSolicitudById(solicitudId: string) {
        const solicitud = await prisma.solicitudCDT.findUnique({
            where: { id: solicitudId },
            include: {
                cliente: {
                    select: {
                        nombres: true,
                        apellidos: true,
                        numeroDocumento: true,
                        telefono: true,
                        usuario: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        return solicitud;
    }

    // Obtener historial de cambios de estado
    async getHistorialSolicitud(solicitudId: string) {
        const solicitud = await prisma.solicitudCDT.findUnique({
            where: { id: solicitudId },
        });

        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        const historial = await prisma.historialEstado.findMany({
            where: { solicitudId },
            orderBy: { createdAt: 'asc' },
        });

        return historial;
    }
}