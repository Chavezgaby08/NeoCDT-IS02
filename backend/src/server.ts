import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import authRoutes from './routes/authRoutes';
import solicitudRoutes from './routes/solicitudRoutes';
import agenteRoutes from './routes/agenteRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Backend está corriendo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/agente', agenteRoutes); // ✅ Nueva ruta para agentes

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    console.log('✅ CORS habilitado para:', process.env.FRONTEND_URL || 'http://localhost:5173');
    console.log('✅ Rutas disponibles:');
    console.log('   - /api/auth (login, register)');
    console.log('   - /api/solicitudes (clientes)');
    console.log('   - /api/agente (agentes/asesores)');
})

export default app;