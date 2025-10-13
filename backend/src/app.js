//Importar módulos necesarios

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno desde el archivo .env
const app = express(); // Crear una instancia de la aplicación Express

app.use(cors()); // Habilitar CORS para permitir solicitudes desde otros dominios
app.use(express.json()); // Middleware para parsear JSON en las solicitudes entrantes

// Ruta raíz para verificar que la API está funcionando
app.get("/", (req, res) => {
  res.json({ message: "La API NeoCDT está lista :)" });
});

export default app; // Exportar la aplicación para su uso en otros módulos
