-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('CLIENTE', 'AGENTE', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('BORRADOR', 'EN_VALIDACION', 'APROBADA', 'RECHAZADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'CLIENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "telefono" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "direccion" TEXT,
    "ciudad" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'CO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_cdt" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "plazoMeses" INTEGER NOT NULL,
    "tasaInteres" DECIMAL(5,2) NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'BORRADOR',
    "motivoRechazo" TEXT,
    "fechaApertura" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_cdt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "estadoAnterior" "EstadoSolicitud",
    "estadoNuevo" "EstadoSolicitud" NOT NULL,
    "observaciones" TEXT,
    "cambiadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuarioId_key" ON "clientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_numeroDocumento_key" ON "clientes"("numeroDocumento");

-- CreateIndex
CREATE INDEX "solicitudes_cdt_clienteId_idx" ON "solicitudes_cdt"("clienteId");

-- CreateIndex
CREATE INDEX "solicitudes_cdt_estado_idx" ON "solicitudes_cdt"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_cdt_createdAt_idx" ON "solicitudes_cdt"("createdAt");

-- CreateIndex
CREATE INDEX "historial_estados_solicitudId_idx" ON "historial_estados"("solicitudId");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cdt" ADD CONSTRAINT "solicitudes_cdt_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes_cdt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
