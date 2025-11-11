# NeoCDT - Sistema de Gestión de CDTs

Proyecto de Ingeniería de Software II — Módulo Bancario "NeoCDT" (Login + CRUD de SolicitudesCDT).

##  Descripción

Sistema bancario para la gestión de Certificados de Depósito a Término (CDTs) desarrollado como parte del módulo de Ingeniería de Software II. Permite a los usuarios crear, consultar y gestionar solicitudes de CDTs con cálculo automático de rentabilidad.

---

## Cómo Correr el Proyecto

### Prerrequisitos

- **Node.js**: v18 o superior
- **PostgreSQL**: v14 o superior
- **npm** o **yarn**
- **Git**

### 1. Clonar el Repositorio
```bash
git clone -b entrega-2-final https://github.com/Chavezgaby08/NeoCDT-IS02.git
cd NeoCDT-IS02
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/neocdt"

# Puerto del servidor
PORT=3000

# JWT (si aplica)
JWT_SECRET="tu_clave_secreta_aqui"

# Entorno
NODE_ENV=development
```

#### Inicializar Base de Datos con Prisma
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Seed de datos iniciales
npx prisma db seed
```

#### Iniciar Backend
```bash
npm run dev
```

El servidor debería estar corriendo en `http://localhost:3000`

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

#### Configurar Variables de Entorno (Frontend)

Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_API_URL=http://localhost:3000/api
```

#### Iniciar Frontend
```bash
npm run dev
```

El frontend debería estar corriendo en `http://localhost:5173`

### 4. Acceder a la Aplicación

Abrir el navegador en: `http://localhost:5173`

---

##  Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- React 18 con Vite
- React Router DOM para navegación
- Axios para peticiones HTTP
- Lucide React para iconografía
- CSS modular
- Jest + React Testing Library para unit tests
- Playwright para E2E tests
- ESLint para linting

**Backend:**
- Node.js con Express
- TypeScript
- Prisma ORM
- PostgreSQL
- CORS habilitado
- Jest para testing
- Validadores personalizados
- Arquitectura en capas (controllers, services, routes)

### Estructura de Carpetas
```
NEOCDT-IS02/
├── backend/
│   ├── node_modules/
│   ├── prisma/
│   │   ├── migrations/      # Migraciones de BD
│   │   ├── schema.prisma    # Modelo de datos Prisma
│   │   └── seed.ts          # Datos iniciales
│   ├── src/
│   │   ├── config/          # Configuraciones
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middlewares/     # Middleware personalizado
│   │   ├── routes/          # Definición de endpoints
│   │   ├── services/        # Servicios auxiliares
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilidades
│   │   ├── validators/      # Validadores de datos
│   │   └── server.ts        # Punto de entrada
│   ├── tests/               # Tests unitarios y E2E
│   │   ├── __mocks__/
│   │   ├── unit/
│   │   └── utils/
│   ├── .eslintrc.json
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── e2e-proyecto/            # Tests End-to-End
│
├── frontend/
│   ├── node_modules/
│   ├── public/              # Assets estáticos
│   ├── scannerwok/          # Módulo de escaneo
│   ├── playwright-report/   # Reportes de Playwright
│   ├── src/
│   │   ├── assets/          # Imágenes y recursos
│   │   ├── components/      # Componentes reutilizables
│   │   ├── context/         # Context API de React
│   │   ├── pages/           # Páginas principales
│   │   │   └── test/        # Páginas de prueba
│   │   ├── test-results/    # Resultados de tests
│   │   ├── App.jsx          # Componente raíz
│   │   ├── index.css        # Estilos globales
│   │   └── main.jsx         # Punto de entrada
│   ├── .babelrc
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── docker-compose.yml
│   ├── eslint.config.js
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── package.json
│   ├── playwright.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Supuestos y Decisiones de Diseño

### Supuestos del Negocio

1. **Monto Mínimo**: $1,000,000 COP
2. **Plazos Disponibles**: 1, 3, 6 meses, 1 año, 2 años
3. **Tasa de Interés Base**: 
   - 1 mes: 8% EA
   - 3 meses: 9% EA
   - 6 meses: 10% EA
   - 1 año: 11% EA
   - 2 años: 12% EA
4. **Estados de Solicitud**: PENDIENTE, APROBADA, RECHAZADA
5. **Un usuario puede tener múltiples solicitudes**

### Decisiones Técnicas

#### 1. **Prisma ORM**
**Por qué:** 
- Type-safety con TypeScript
- Migraciones automáticas
- Queries optimizadas
- Developer experience superior

#### 2. **React + Vite**
**Por qué:**
- Hot Module Replacement ultrarrápido
- Build optimizado para producción
- Configuración mínima
- Excelente DX

#### 3. **Arquitectura MVC**
**Por qué:**
- Simplicidad y estándares establecidos
- Fácil de testear y documentar
- Compatible con múltiples clientes
- Escalable

#### 4. **PostgreSQL**
**Por qué:**
- Robustez y confiabilidad
- Soporte para transacciones ACID
- Excelente para datos financieros
- Open source

#### 5. **React Context API**
**Por qué:**
- Gestión de estado global sin librerías externas
- Evita prop drilling
- Perfecto para autenticación y datos de usuario
- Nativo de React

#### 6. **Jest + Playwright**
**Por qué:**
- Jest: Excelente para unit tests, rápido y confiable
- Playwright: Tests E2E robustos, multi-browser
- Coverage automático
- Integración con CI/CD

#### 7. **Docker Compose**
**Por qué:**
- Facilita despliegue consistente
- Ambiente reproducible
- PostgreSQL containerizado
- Simplifica onboarding de nuevos devs

---



## Pruebas y Métricas

### Estrategia de Testing

El proyecto implementa una estrategia de testing en tres niveles:

1. **Unit Tests (Jest)** - Backend y Frontend
2. **Integration Tests (Jest)** - Backend
3. **E2E Tests (Playwright)** - Flujos completos de usuario

### Ejecutar Tests
```bash
# Backend - Tests unitarios
cd backend
npm test

# Frontend - Tests unitarios
cd frontend
npm test

# E2E - Tests completos
cd e2e-proyecto
npm run test

# Playwright UI Mode (interactivo)
cd frontend
npm run test:ui
```
