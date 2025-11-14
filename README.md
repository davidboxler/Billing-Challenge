# Sistema de Facturación - Microservicios

Sistema completo de gestión de órdenes y facturación construido con arquitectura de microservicios utilizando NestJS, TypeORM y PostgreSQL.

## Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Prerequisitos](#prerequisitos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Documentación API](#documentación-api)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints Principales](#endpoints-principales)
- [Base de Datos](#base-de-datos)
- [Testing](#testing)
- [Workflow de Desarrollo](#workflow-de-desarrollo)

## Características

- Arquitectura de microservicios con separación de responsabilidades
- API Gateway como punto de entrada único
- Gestión completa de órdenes (CRUD + soft delete)
- Gestión de facturas con idempotencia
- Comunicación entre microservicios
- Documentación Swagger interactiva
- Paginación, filtrado, ordenamiento y búsqueda
- Seeds para datos de prueba
- Índices de base de datos optimizados
- Validación de datos con class-validator
- Manejo de errores consistente

## Arquitectura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ HTTP
       ▼
┌─────────────────────────────┐
│      API Gateway            │
│      (Puerto 3000)          │
└──────┬─────────────┬────────┘
       │             │
       │             │
       ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Management   │  │   Invoice    │
│  Service     │  │   Service    │
│ (Puerto 3001)│  │ (Puerto 3002)│
└──────┬───────┘  └──────┬───────┘
       │                 │
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │ PostgreSQL   │
│ managementdb │  │  invoicedb   │
│ (Puerto 5432)│  │ (Puerto 5433)│
└──────────────┘  └──────────────┘
```

### Servicios

- **API Gateway** (puerto 3000)
  - Punto de entrada único al sistema
  - Proxy routing a microservicios
  - Middleware de logging HTTP
  - CORS habilitado

- **Management Service** (puerto 3001)
  - Gestión de órdenes
  - CRUD completo con soft delete
  - Filtrado por estado y estado de factura
  - Búsqueda por tracking code y nombre
  - Comunicación con Invoice Service

- **Invoice Service** (puerto 3002)
  - Gestión de facturas
  - Idempotencia con tracking codes
  - Filtrado por fechas y orderId
  - Búsqueda por tracking code y autor

## Tecnologías

- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **Base de Datos**: PostgreSQL 15
- **Contenedores**: Docker & Docker Compose
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator, class-transformer
- **HTTP Client**: Axios
- **Proxy**: http-proxy-middleware

## Prerequisitos

- Node.js 20+
- npm 9+
- Docker 24+
- Docker Compose 2+
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd billing-challenge
```

### 2. Levantar bases de datos con Docker

```bash
docker compose up -d postgres-management postgres-invoice
```

Verificar que los contenedores estén corriendo:

```bash
docker compose ps
```

### 3. Instalar dependencias

```bash
# Management Service
cd management-service
npm install

# Invoice Service
cd ../invoice-service
npm install

# API Gateway
cd ../api-gateway
npm install
```

### 4. Configurar variables de entorno

Cada servicio tiene su archivo `.env` con valores por defecto. No es necesario modificarlos para desarrollo local.

**Management Service** (.env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=managementdb
PORT=3001
INVOICE_SERVICE_URL=http://localhost:3002
```

**Invoice Service** (.env):
```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=invoicedb
PORT=3002
```

**API Gateway** (.env):
```env
PORT=3000
MANAGEMENT_SERVICE_URL=http://localhost:3001
INVOICE_SERVICE_URL=http://localhost:3002
```

### 5. Poblar base de datos (Opcional)

Ejecutar seeds para datos de prueba:

```bash
# Seed de órdenes (10 registros)
cd management-service
npm run seed

# Seed de facturas (8 registros)
cd ../invoice-service
npm run seed
```

## Ejecución

### Modo Desarrollo

Abrir 3 terminales y ejecutar cada servicio:

```bash
# Terminal 1 - Management Service
cd management-service
npm run start:dev

# Terminal 2 - Invoice Service
cd invoice-service
npm run start:dev

# Terminal 3 - API Gateway
cd api-gateway
npm run start:dev
```

Los servicios estarán disponibles en:
- API Gateway: http://localhost:3000
- Management Service: http://localhost:3001
- Invoice Service: http://localhost:3002

### Modo Producción

```bash
# Build
npm run build

# Start
npm run start:prod
```

### Con Docker Compose (todos los servicios)

```bash
docker compose up -d
```

## Documentación API

### Swagger UI

Cada servicio tiene documentación Swagger interactiva:

- **Management Service**: http://localhost:3001/api
- **Invoice Service**: http://localhost:3002/api
- **API Gateway**: http://localhost:3000/api

### Colección Postman/Insomnia

Ver archivo `api-collection.json` en la raíz del proyecto.

## Estructura del Proyecto

```
billing-challenge/
├── api-gateway/
│   ├── src/
│   │   ├── common/
│   │   │   └── middleware/
│   │   │       └── logger.middleware.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
│
├── management-service/
│   ├── src/
│   │   ├── orders/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── orders.module.ts
│   │   ├── seeds/
│   │   │   ├── order.seed.ts
│   │   │   └── run-seed.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
│
├── invoice-service/
│   ├── src/
│   │   ├── invoices/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── invoices.controller.ts
│   │   │   ├── invoices.service.ts
│   │   │   └── invoices.module.ts
│   │   ├── seeds/
│   │   │   ├── invoice.seed.ts
│   │   │   └── run-seed.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
├── DATABASE.md
└── README.md
```

## Endpoints Principales

### A través del API Gateway (Punto de entrada recomendado)

#### Órdenes

```
GET    /orders              - Listar órdenes (con paginación, filtros)
GET    /orders/:id          - Obtener orden por ID
POST   /orders              - Crear nueva orden
PATCH  /orders/:id          - Actualizar orden
DELETE /orders/:id          - Soft delete de orden
PATCH  /orders/:id/invoice  - Marcar orden como facturada
```

#### Facturas

```
GET    /invoices            - Listar facturas (con paginación, filtros)
GET    /invoices/:id        - Obtener factura por ID
POST   /invoices            - Crear nueva factura
```

### Ejemplos de uso

#### Crear una orden

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Juan Pérez",
    "trackingCode": "ORD-2024-100"
  }'
```

#### Listar órdenes con filtros

```bash
# Paginación
curl "http://localhost:3000/orders?page=1&limit=10"

# Filtrar por estado
curl "http://localhost:3000/orders?status=ACTIVE"

# Filtrar por estado de factura
curl "http://localhost:3000/orders?invoiceStatus=PENDING"

# Búsqueda
curl "http://localhost:3000/orders?search=Juan"

# Ordenamiento
curl "http://localhost:3000/orders?sortBy=createdAt&sortDir=DESC"

# Combinar filtros
curl "http://localhost:3000/orders?status=ACTIVE&invoiceStatus=PENDING&page=1&limit=5"
```

#### Crear una factura

```bash
curl -X POST http://localhost:3000/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 150.50,
    "issuedDate": "2024-01-15",
    "trackingCode": "INV-2024-001",
    "author": "María García"
  }'
```

#### Listar facturas con filtros

```bash
# Por rango de fechas
curl "http://localhost:3000/invoices?startDate=2024-01-01&endDate=2024-12-31"

# Por orderId
curl "http://localhost:3000/invoices?orderId=1"

# Búsqueda por autor
curl "http://localhost:3000/invoices?search=María"
```

## Base de Datos

### Schema

Ver documentación completa en [DATABASE.md](./DATABASE.md)

#### Tabla Orders

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer | Primary key |
| customerName | varchar(255) | Nombre del cliente |
| trackingCode | varchar(100) | Código único de seguimiento |
| status | enum | ACTIVE, INACTIVE |
| invoiceStatus | enum | PENDING, INVOICED |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Última actualización |
| deletedAt | timestamp | Soft delete |

#### Tabla Invoices

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer | Primary key |
| orderId | integer | FK a orders |
| amount | decimal(10,2) | Monto |
| issuedDate | timestamp | Fecha de emisión |
| trackingCode | varchar(255) | Código único (idempotencia) |
| author | varchar(255) | Autor |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Última actualización |

### Índices Implementados

**Orders:**
- `idx_tracking_code` - Búsquedas por código
- `idx_status` - Filtrado por estado
- `idx_invoice_status` - Filtrado por estado de factura
- `idx_created_at` - Ordenamiento temporal

**Invoices:**
- `idx_tracking_code` (unique) - Idempotencia
- `idx_order_id` - Relación con órdenes

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Workflow de Desarrollo

### GitFlow

El proyecto utiliza GitFlow con las siguientes ramas:

- **master**: Rama principal de producción
- **develop**: Rama de desarrollo activo
- **feature/***: Ramas para nuevas funcionalidades

### Proceso de desarrollo

1. Crear feature branch desde develop:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad
```

2. Hacer cambios y commits

```bash
git add .
git commit -m "Descripción del cambio"
```

3. Push de la feature branch

```bash
git push -u origin feature/nombre-funcionalidad
```

4. Merge a develop

```bash
git checkout develop
git merge feature/nombre-funcionalidad --ff-only
git push origin develop
```

## Estado del Proyecto

- [x] Estructura base del proyecto
- [x] Configuración Docker
- [x] Inicialización servicios NestJS
- [x] Management Service CRUD completo
- [x] Invoice Service CRUD completo
- [x] Comunicación entre microservicios
- [x] API Gateway con proxy routing
- [x] Soft delete en órdenes
- [x] Filtrado, paginación y búsqueda
- [x] Idempotencia en facturas
- [x] Documentación Swagger
- [x] Seeds de base de datos
- [x] Índices optimizados
- [x] Documentación completa

## Comandos Útiles

### Docker

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Limpiar volúmenes
docker compose down -v
```

### NPM Scripts (por servicio)

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Linting
npm run lint

# Format
npm run format

# Seeds (solo management/invoice services)
npm run seed
```

## Troubleshooting

### Puerto ya en uso

Si un puerto ya está en uso, matar el proceso:

```bash
# Windows
netstat -ano | findstr :<puerto>
taskkill /F /PID <pid>

# Linux/Mac
lsof -ti:<puerto> | xargs kill -9
```

### Conexión a base de datos falla

1. Verificar que los contenedores Docker estén corriendo
2. Verificar variables de entorno en archivos .env
3. Verificar puertos en docker-compose.yml

### Servicios no responden

1. Verificar logs de cada servicio
2. Reiniciar servicios en orden: bases de datos → microservicios → gateway
3. Limpiar carpeta dist y node_modules, reinstalar

## Contribuciones

1. Fork el proyecto
2. Crear feature branch
3. Commit cambios
4. Push a la branch
5. Abrir Pull Request

## Licencia

Este proyecto es privado y confidencial.

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.
