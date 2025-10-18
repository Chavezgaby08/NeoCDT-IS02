import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Limpiar base de datos
  await prisma.historialEstado.deleteMany();
  await prisma.solicitudCDT.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Base de datos limpiada');

  // Crear usuarios de prueba
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Usuario 1: Cliente Juan
  const usuario1 = await prisma.usuario.create({
    data: {
      email: 'juan@example.com',
      password: hashedPassword,
      rol: 'CLIENTE',
      cliente: {
        create: {
          nombres: 'Juan Carlos',
          apellidos: 'Pérez González',
          tipoDocumento: 'CC',
          numeroDocumento: '1234567890',
          telefono: '3216549870',
          fechaNacimiento: new Date('1990-05-15'),
          direccion: 'Calle 123 #45-67',
          ciudad: 'Bogotá',
          pais: 'CO',
        },
      },
    },
    include: {
      cliente: true,
    },
  });

  console.log('Usuario Juan creado:', usuario1.email);

  // Usuario 2: Cliente María
  const usuario2 = await prisma.usuario.create({
    data: {
      email: 'maria@example.com',
      password: hashedPassword,
      rol: 'CLIENTE',
      cliente: {
        create: {
          nombres: 'María Fernanda',
          apellidos: 'López Martínez',
          tipoDocumento: 'CC',
          numeroDocumento: '9876543210',
          telefono: '3109876543',
          fechaNacimiento: new Date('1985-08-20'),
          direccion: 'Carrera 45 #12-34',
          ciudad: 'Medellín',
          pais: 'CO',
        },
      },
    },
    include: {
      cliente: true,
    },
  });

  console.log('Usuario María creado:', usuario2.email);

  // Usuario 3: Agente bancario
  const agente = await prisma.usuario.create({
    data: {
      email: 'agente@neobank.com',
      password: hashedPassword,
      rol: 'AGENTE',
    },
  });

  console.log('Usuario Agente creado:', agente.email);

  // Crear solicitudes CDT para Juan
  const solicitud1 = await prisma.solicitudCDT.create({
    data: {
      clienteId: usuario1.cliente!.id,
      monto: 5000000,
      plazoMeses: 12,
      tasaInteres: 8.5,
      estado: 'BORRADOR',
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud1.id,
      estadoNuevo: 'BORRADOR',
      observaciones: 'Solicitud creada',
      cambiadoPor: usuario1.id,
    },
  });

  const solicitud2 = await prisma.solicitudCDT.create({
    data: {
      clienteId: usuario1.cliente!.id,
      monto: 10000000,
      plazoMeses: 24,
      tasaInteres: 9.2,
      estado: 'APROBADA',
      fechaApertura: new Date(),
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud2.id,
      estadoNuevo: 'BORRADOR',
      observaciones: 'Solicitud creada',
      cambiadoPor: usuario1.id,
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud2.id,
      estadoAnterior: 'BORRADOR',
      estadoNuevo: 'APROBADA',
      observaciones: 'Solicitud aprobada por el agente',
      cambiadoPor: agente.id,
    },
  });

  console.log('Solicitudes CDT creadas para Juan');

  // Crear solicitudes para María
  const solicitud3 = await prisma.solicitudCDT.create({
    data: {
      clienteId: usuario2.cliente!.id,
      monto: 3000000,
      plazoMeses: 6,
      tasaInteres: 7.8,
      estado: 'EN_VALIDACION',
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud3.id,
      estadoNuevo: 'BORRADOR',
      observaciones: 'Solicitud creada',
      cambiadoPor: usuario2.id,
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud3.id,
      estadoAnterior: 'BORRADOR',
      estadoNuevo: 'EN_VALIDACION',
      observaciones: 'Solicitud enviada a validación',
      cambiadoPor: usuario2.id,
    },
  });

  const solicitud4 = await prisma.solicitudCDT.create({
    data: {
      clienteId: usuario2.cliente!.id,
      monto: 2000000,
      plazoMeses: 3,
      tasaInteres: 7.0,
      estado: 'RECHAZADA',
      motivoRechazo: 'No cumple con los requisitos de ingresos mínimos',
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud4.id,
      estadoNuevo: 'BORRADOR',
      observaciones: 'Solicitud creada',
      cambiadoPor: usuario2.id,
    },
  });

  await prisma.historialEstado.create({
    data: {
      solicitudId: solicitud4.id,
      estadoAnterior: 'BORRADOR',
      estadoNuevo: 'RECHAZADA',
      observaciones: 'No cumple requisitos',
      cambiadoPor: agente.id,
    },
  });

  console.log(' Solicitudes CDT creadas para María');

  console.log('\n Resumen del seed:');
  console.log('- 3 Usuarios creados (2 clientes + 1 agente)');
  console.log('- 4 Solicitudes CDT creadas');
  console.log('- Estados: BORRADOR, APROBADA, EN_VALIDACION, RECHAZADA');
  console.log('\n Credenciales de prueba:');
  console.log('   juan@example.com / password123');
  console.log('   maria@example.com / password123');
  console.log('   agente@neobank.com / password123');
  console.log('\n Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error(' Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });