# Pruebas E2E para NeoCDT

Este proyecto contiene pruebas end-to-end (E2E) utilizando Playwright para validar los flujos críticos de la aplicación NeoCDT.

## Requisitos previos

- Node.js v16 o superior
- npm v7 o superior

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Instalar navegadores para Playwright:

```bash
npx playwright install
```

## Configuración

Antes de ejecutar las pruebas, asegúrate de configurar la URL base en `playwright.config.ts`:

```typescript
baseURL: "http://localhost:5173"; // Ajusta según tu entorno
```

## Ejecutar pruebas

- Ejecutar todas las pruebas:

```bash
npm test
```

- Ejecutar pruebas con UI:

```bash
npm run test:ui
```

- Ver reporte HTML:

```bash
npm run report
```

## Tests implementados

1. `01_auth.spec.ts`

   - Login exitoso
   - Login fallido (caso negativo)

2. `02_register.spec.ts`

   - Registro exitoso de usuario
   - Registro con datos inválidos (caso negativo)

3. `03_create_cdt.spec.ts`

   - Creación exitosa de solicitud CDT
   - Creación con campos vacíos (caso negativo)

4. `04_list_and_filter.spec.ts`

   - Listar solicitudes y verificar datos
   - Filtrar por estado
   - Filtrar por rango de fechas

5. `07_agent_approve_reject.spec.ts`
   - Aprobar solicitud como agente
   - Rechazar solicitud con observación

## Suposiciones

- IDs y selectores:
  - Los campos de formulario tienen labels accesibles (ej: "Email", "Contraseña")
  - Los botones tienen nombres descriptivos (ej: "Ingresar", "Registrarme", "Guardar")
- Endpoints API:

  - `/api/auth/login` - Autenticación
  - `/api/users/register` - Registro
  - `/api/solicitudes` - CRUD de solicitudes
  - `/api/solicitudes/:id/aprobar` - Aprobar solicitud
  - `/api/solicitudes/:id/rechazar` - Rechazar solicitud

- Estados de solicitud:
  - Borrador
  - En validación
  - Aprobada
  - Rechazada

## Notas adicionales

- Las pruebas usan mocking de respuestas API para independencia del backend
- Se priorizaron flujos críticos según las historias de usuario
- Se incluyen validaciones tanto de UI como de datos
- Las pruebas son idempotentes y pueden ejecutarse en paralelo
