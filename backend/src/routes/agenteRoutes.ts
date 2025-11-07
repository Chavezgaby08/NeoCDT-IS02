import { Router } from 'express';
import { AgenteController } from '../controllers/agenteController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router = Router();
const agenteController = new AgenteController();

// Todas las rutas requieren autenticación Y rol de AGENTE
router.use(authenticate);
router.use(requireRole('AGENTE', 'ADMINISTRADOR'));

// Estadísticas del dashboard
router.get('/estadisticas', agenteController.getEstadisticas.bind(agenteController));

// Obtener todas las solicitudes (con filtros)
router.get('/solicitudes', agenteController.getAllSolicitudes.bind(agenteController));

// Obtener solicitud por ID
router.get('/solicitudes/:id', agenteController.getSolicitudById.bind(agenteController));

// Obtener historial de una solicitud
router.get('/solicitudes/:id/historial', agenteController.getHistorialSolicitud.bind(agenteController));

// Aprobar solicitud
router.post('/solicitudes/:id/aprobar', agenteController.aprobarSolicitud.bind(agenteController));

// Rechazar solicitud
router.post('/solicitudes/:id/rechazar', agenteController.rechazarSolicitud.bind(agenteController));

export default router;