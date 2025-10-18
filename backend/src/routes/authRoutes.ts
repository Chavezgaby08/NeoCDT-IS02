import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../validators/authValidator';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;
