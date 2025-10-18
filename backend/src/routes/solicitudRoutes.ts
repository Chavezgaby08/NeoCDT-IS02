import { Router } from 'express';
import { SolicitudController } from '../controllers/solicitudController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createSolicitudSchema, updateSolicitudSchema } from '../validators/solicitudValidator';

const router = Router();
const solicitudController = new SolicitudController();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', solicitudController.getAll.bind(solicitudController));
router.get('/:id', solicitudController.getById.bind(solicitudController));
router.post('/', validateRequest(createSolicitudSchema), solicitudController.create.bind(solicitudController));
router.put('/:id', validateRequest(updateSolicitudSchema), solicitudController.update.bind(solicitudController));
router.delete('/:id', solicitudController.delete.bind(solicitudController));

export default router;