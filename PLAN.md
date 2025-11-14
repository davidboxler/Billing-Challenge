# Plan de Implementación - Sistema de Facturación con Microservicios

## Objetivo
Diseñar y construir un backend distribuido con arquitectura de microservicios para gestión de órdenes y facturación, cumpliendo con todos los requerimientos del challenge.

## Arquitectura del Sistema

```
┌─────────────┐
│ API Gateway │ (Puerto 3000)
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
┌──────▼────────┐  ┌─────▼─────────┐  ┌─────▼────────┐
│  Management   │  │    Invoice    │  │   Databases  │
│  Service      │  │    Service    │  │              │
│  (Puerto 3001)│  │  (Puerto 3002)│  │              │
└──────┬────────┘  └──────┬────────┘  └──────────────┘
       │                  │
┌──────▼────────┐  ┌─────▼─────────┐
│ management-db │  │  invoice-db   │
│ PostgreSQL    │  │  PostgreSQL   │
│ (Puerto 5432) │  │ (Puerto 5433) │
└───────────────┘  └───────────────┘
```

## Entidades del Sistema

### Order (Management Service)
- `id`: UUID, PK
- `customerName`: string
- `trackingCode`: string, único entre activos
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `invoiceStatus`: PENDING | INVOICED
- `status`: ACTIVE | INACTIVE

### Invoice (Invoice Service)
- `id`: UUID, PK
- `trackingCode`: string, único
- `billedAt`: timestamp
- `author`: string

## Fases de Implementación

### FASE 0: Setup Inicial (COMPLETADA)
- [x] Estructura base del proyecto con NestJS
- [x] Configuración de Docker y docker-compose
- [x] Inicialización de servicios (API Gateway, Management, Invoice)
- [x] Configuración de bases de datos PostgreSQL

### FASE 1: Management Service - CRUD Básico (COMPLETADA)
- [x] Entidad Order con TypeORM
- [x] Migrations para tabla orders
- [x] Repository Pattern para órdenes
- [x] DTOs con validaciones
- [x] CRUD básico de órdenes
- [x] Implementar borrado lógico (status = INACTIVE)

### FASE 2: Invoice Service - CRUD Básico (COMPLETADA)
- [x] Entidad Invoice con TypeORM
- [x] Migrations para tabla invoices
- [x] Repository Pattern para facturas
- [x] DTOs con validaciones
- [x] Creación y consulta de facturas
- [x] Idempotencia por trackingCode
- [x] Documentación Swagger

### FASE 3: Endpoints Avanzados de Orders (COMPLETADA)
**Branch:** `feature/advanced-orders-endpoints`

#### 3.1. GET /orders - Listado con filtros avanzados
- [x] Paginación (page, limit, max 100)
- [x] Búsqueda (customerName o trackingCode con ILIKE)
- [x] Filtros: status, invoiceStatus, createdFrom, createdTo
- [x] Ordenamiento: sortBy (createdAt, customerName, trackingCode, invoiceStatus)
- [x] Respuesta: `{items, total, page, limit, hasNext}`

#### 3.2. POST /orders - Crear orden
- [x] Validación de campos obligatorios
- [x] Validar unicidad de trackingCode entre órdenes ACTIVAS
- [x] Crear con status=ACTIVE e invoiceStatus=PENDING
- [x] Error 409 si trackingCode duplicado

#### 3.3. PUT /orders/:id - Actualizar orden
- [x] Modificar campos (excepto id, createdAt)
- [x] Mantener unicidad de trackingCode
- [x] No permitir revertir INVOICED → PENDING
- [x] Validaciones de negocio

#### 3.4. DELETE /orders/:id - Borrado lógico
- [x] Cambiar status a INACTIVE
- [x] Idempotente (no falla si ya está inactiva)

#### 3.5. Agregar Swagger a Management Service
- [x] Documentar todos los endpoints
- [x] Ejemplos de requests y responses

### FASE 4: Endpoint de Facturación (Comunicación entre Servicios) (COMPLETADA)
**Branch:** `feature/invoice-orders`

#### 4.1. POST /orders/invoice - Facturar órdenes
- [x] Endpoint en Management Service
- [x] Validar órdenes activas y pendientes
- [x] Comunicación HTTP con Invoice Service
- [x] Crear factura (idempotente por trackingCode)
- [x] Actualizar orden a INVOICED
- [x] Respuesta: `{success: [{orderId, invoiceId}], errors: [{orderId, reason}]}`

#### 4.2. Manejo de Transacciones y Errores
- [x] Rollback si falla creación de factura
- [x] Manejo de errores de red
- [x] Logging de operaciones

### FASE 5: Endpoints Avanzados de Invoices (COMPLETADA)
**Branch:** `feature/advanced-invoices-endpoints`

#### 5.1. GET /invoices - Listado con filtros avanzados
- [x] Paginación (page, limit, max 100)
- [x] Búsqueda (author o trackingCode)
- [x] Ordenamiento: sortBy (billedAt, trackingCode, author)
- [x] Respuesta: `{items, total, page, limit, hasNext}`

#### 5.2. Validaciones adicionales
- [x] Inmutabilidad de facturas (no PUT/DELETE)
- [x] Idempotencia estricta por trackingCode

### FASE 6: API Gateway - Routing (COMPLETADA)
**Branch:** `feature/api-gateway-routing`

#### 6.1. Configurar Proxy
- [x] Redirigir /orders/* → Management Service
- [x] Redirigir /invoices/* → Invoice Service

#### 6.2. Middleware y Seguridad
- [x] Logging de requests
- [x] Rate limiting (opcional)
- [x] CORS configurado
- [x] Manejo de errores centralizado

### FASE 7: Mejoras de Base de Datos (COMPLETADA)
**Branch:** `feature/database-optimizations`

#### 7.1. Índices y Optimizaciones
- [x] Índice único en trackingCode (orders ACTIVAS)
- [x] Índice en invoiceStatus
- [x] Índice en createdAt para ordenamiento
- [x] Índice en trackingCode (invoices)

#### 7.2. Migrations Avanzadas
- [x] Seeds para datos de prueba
- [x] Scripts de rollback
- [x] Documentación de schema

### FASE 8: Documentación y Testing (COMPLETADA)
**Branch:** `feature/documentation-testing`

#### 8.1. Documentación
- [x] README completo con setup
- [x] Documentación de arquitectura
- [x] Diagramas de flujo
- [x] Colección Postman/Insomnia
- [x] Swagger completo en todos los servicios

#### 8.2. Testing (Opcional)
- [ ] Unit tests para servicios
- [ ] Integration tests
- [ ] E2E tests

## Endpoints Finales del Sistema

### Orders (via API Gateway: localhost:3000)
```
GET    /orders              # Listar con filtros
POST   /orders              # Crear orden
PUT    /orders/:id          # Actualizar orden
DELETE /orders/:id          # Borrado lógico
POST   /orders/invoice      # Facturar órdenes
```

### Invoices (via API Gateway: localhost:3000)
```
GET    /invoices            # Listar con filtros
POST   /invoices            # Crear factura (interno)
```

## Reglas de Negocio Críticas

1. **Borrado Lógico**: Las órdenes NUNCA se eliminan físicamente
2. **Facturas Inmutables**: No se pueden modificar ni eliminar
3. **Idempotencia**: trackingCode garantiza que no se dupliquen facturas
4. **Estado de Facturación**: Una vez INVOICED, no puede volver a PENDING
5. **Unicidad de trackingCode**: Solo entre órdenes ACTIVAS

## Stack Tecnológico

- **Backend**: Node.js + TypeScript + NestJS
- **Base de Datos**: PostgreSQL (2 instancias)
- **ORM**: TypeORM con migrations
- **Infraestructura**: Docker + docker-compose
- **Documentación**: Swagger/OpenAPI
- **Patrones**: SOLID, Repository Pattern, DTOs

## Comandos Útiles

### Levantar todo el sistema
```bash
docker-compose up -d
```

### Desarrollo local
```bash
# Terminal 1 - Management Service
cd management-service && npm run start:dev

# Terminal 2 - Invoice Service
cd invoice-service && npm run start:dev

# Terminal 3 - API Gateway
cd api-gateway && npm run start:dev
```

### Acceder a Swagger
```
Management Service: http://localhost:3001/api
Invoice Service:    http://localhost:3002/api
API Gateway:        http://localhost:3000/api (cuando esté implementado)
```

## Estado Actual

**Completado:**
- Fase 0: Setup inicial ✅
- Fase 1: Management Service CRUD básico ✅
- Fase 2: Invoice Service CRUD básico + Swagger ✅
- Fase 3: Endpoints avanzados de Orders ✅
- Fase 4: Endpoint de facturación y comunicación entre servicios ✅
- Fase 5: Endpoints avanzados de Invoices ✅
- Fase 6: API Gateway con routing y middleware ✅
- Fase 7: Optimizaciones de base de datos y seeds ✅
- Fase 8: Documentación completa ✅

**Proyecto completado y listo para producción**

## Notas Técnicas

- Usar UUID v4 para IDs
- Timestamps en UTC
- Validaciones con class-validator
- DTOs separados para Create/Update/Query
- Error handling consistente
- Logging estructurado

## Autores

**David** - Desarrollador Principal
- Email: davidboxler47@gmail.com

**Claude** - Asistente de IA
- Anthropic's Claude Code
