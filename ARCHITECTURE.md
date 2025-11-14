# Arquitectura del Sistema

## Visión General

El sistema de facturación está construido utilizando una arquitectura de microservicios con NestJS, siguiendo principios de diseño como separación de responsabilidades, escalabilidad horizontal y mantenibilidad.

## Diagrama de Arquitectura

```
                                Internet
                                   │
                                   │
                                   ▼
                        ┌──────────────────┐
                        │   Load Balancer  │
                        │   (Producción)   │
                        └─────────┬────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   API Gateway    │
                        │   Puerto: 3000   │
                        │                  │
                        │  - Proxy Routing │
                        │  - HTTP Logging  │
                        │  - CORS          │
                        └─────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐      ┌───────────────────┐
        │ Management Service│      │  Invoice Service  │
        │  Puerto: 3001     │      │   Puerto: 3002    │
        │                   │      │                   │
        │  - Orders CRUD    │      │  - Invoices CRUD  │
        │  - Soft Delete    │◄─────┤  - Idempotency    │
        │  - Filters        │ HTTP │  - Date Filters   │
        │  - Search         │      │  - Search         │
        └─────────┬─────────┘      └─────────┬─────────┘
                  │                           │
                  │                           │
                  ▼                           ▼
        ┌───────────────────┐      ┌───────────────────┐
        │   PostgreSQL      │      │   PostgreSQL      │
        │   managementdb    │      │    invoicedb      │
        │   Puerto: 5432    │      │   Puerto: 5433    │
        │                   │      │                   │
        │  - orders table   │      │  - invoices table │
        │  - índices        │      │  - índices        │
        └───────────────────┘      └───────────────────┘
```

## Componentes del Sistema

### 1. API Gateway

**Responsabilidad:** Punto de entrada único al sistema

**Tecnologías:**
- NestJS
- http-proxy-middleware
- Express

**Funcionalidades:**
- Routing y proxy a microservicios
- Logging de peticiones HTTP
- Configuración CORS
- Path rewriting

**Endpoints:**
- `/orders/*` → Management Service
- `/invoices/*` → Invoice Service

**Configuración:**
```typescript
app.use('/orders', createProxyMiddleware({
  target: process.env.MANAGEMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/orders${path}`
}));
```

### 2. Management Service

**Responsabilidad:** Gestión de órdenes

**Tecnologías:**
- NestJS
- TypeORM
- PostgreSQL
- Axios (para comunicación)

**Funcionalidades:**
- CRUD completo de órdenes
- Soft delete con deletedAt
- Filtrado por status e invoiceStatus
- Búsqueda por trackingCode y customerName
- Paginación y ordenamiento
- Comunicación con Invoice Service
- Actualización de estado de facturación

**Modelo de Datos:**
```typescript
Order {
  id: number
  customerName: string
  trackingCode: string (índice)
  status: OrderStatus (índice)
  invoiceStatus: InvoiceStatus (índice)
  createdAt: Date (índice)
  updatedAt: Date
  deletedAt: Date | null
}
```

**Comunicación Inter-servicio:**
- Llama a Invoice Service para crear facturas
- Actualiza invoiceStatus cuando se crea factura

### 3. Invoice Service

**Responsabilidad:** Gestión de facturas

**Tecnologías:**
- NestJS
- TypeORM
- PostgreSQL

**Funcionalidades:**
- CRUD de facturas
- Idempotencia con trackingCode único
- Filtrado por orderId y fechas
- Búsqueda por trackingCode y author
- Paginación y ordenamiento

**Modelo de Datos:**
```typescript
Invoice {
  id: number
  orderId: number (índice)
  amount: decimal(10,2)
  issuedDate: Date
  trackingCode: string (índice único)
  author: string
  createdAt: Date
  updatedAt: Date
}
```

**Idempotencia:**
```typescript
// Si existe factura con mismo trackingCode, retornar existente
const existing = await findOne({ trackingCode });
if (existing) return existing;
```

## Patrones de Diseño

### 1. API Gateway Pattern

El API Gateway actúa como punto de entrada único:
- Simplifica la interfaz del cliente
- Centraliza logging y seguridad
- Permite evolución independiente de servicios

### 2. Database per Service

Cada microservicio tiene su propia base de datos:
- Acoplamiento reducido
- Escalabilidad independiente
- Tecnologías diferentes si es necesario

### 3. Soft Delete

Las órdenes usan soft delete en lugar de eliminación física:
- Preserva datos históricos
- Permite auditoría
- Recuperación de datos

```typescript
@DeleteDateColumn()
deletedAt: Date;
```

### 4. Idempotencia

Las facturas implementan idempotencia con trackingCode:
- Previene duplicados
- Seguridad en reintentos
- Consistencia de datos

### 5. Repository Pattern

Uso de TypeORM Repository para acceso a datos:
- Abstracción de la capa de datos
- Testabilidad mejorada
- Código más limpio

## Flujos de Trabajo

### Flujo 1: Crear Orden

```
Cliente → API Gateway → Management Service
                            ↓
                        PostgreSQL (managementdb)
                            ↓
                        ← Orden creada
```

### Flujo 2: Crear Factura

```
Cliente → API Gateway → Invoice Service
                            ↓
                        Verificar idempotencia
                            ↓
                        PostgreSQL (invoicedb)
                            ↓
                        ← Factura creada
```

### Flujo 3: Facturar Orden (Inter-servicio)

```
Cliente → API Gateway → Management Service
                            ↓
                        Axios HTTP POST
                            ↓
                        Invoice Service
                            ↓
                        Crear factura
                            ↓
                        Management Service
                            ↓
                        Actualizar invoiceStatus
                            ↓
                        ← Orden facturada
```

## Comunicación entre Servicios

### HTTP Síncrono

Los servicios se comunican vía HTTP REST:

```typescript
// Management Service llama a Invoice Service
this.httpService.post(
  `${INVOICE_SERVICE_URL}/invoices`,
  invoiceData
);
```

**Ventajas:**
- Simplicidad
- Debugging fácil
- Compatibilidad

**Desventajas:**
- Acoplamiento temporal
- Requiere retry logic
- Latencia

### Alternativas Futuras

Para mayor escalabilidad:
- Message Queue (RabbitMQ, Kafka)
- Event-Driven Architecture
- GraphQL Federation

## Seguridad

### Implementado

1. **Validación de Datos**
```typescript
@IsString()
@IsNotEmpty()
customerName: string;
```

2. **CORS Configurado**
```typescript
app.enableCors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
});
```

3. **Índices Únicos**
```typescript
@Column({ unique: true })
trackingCode: string;
```

### Por Implementar (Producción)

1. **Autenticación & Autorización**
   - JWT tokens
   - OAuth 2.0
   - API Keys

2. **Rate Limiting**
   - Throttling por IP
   - Límites por usuario

3. **Encriptación**
   - HTTPS obligatorio
   - Datos sensibles encriptados

4. **Logging & Monitoring**
   - Centralización de logs
   - APM (Application Performance Monitoring)
   - Alertas

## Escalabilidad

### Horizontal Scaling

Cada servicio puede escalar independientemente:

```yaml
# Docker Compose con réplicas
services:
  management-service:
    deploy:
      replicas: 3
  invoice-service:
    deploy:
      replicas: 2
```

### Database Scaling

Opciones para escalar PostgreSQL:
- Read replicas
- Connection pooling
- Particionamiento
- Sharding

### Caching

Layers de cache potenciales:
- Redis para sesiones
- Cache de queries frecuentes
- CDN para assets estáticos

## Resiliencia

### Implementado

1. **Soft Delete** - Recuperación de datos
2. **Idempotencia** - Reintentos seguros
3. **Validación** - Prevención de errores

### Por Implementar

1. **Circuit Breaker**
```typescript
@Retry({ maxAttempts: 3 })
@CircuitBreaker({ threshold: 5 })
async callInvoiceService() { }
```

2. **Health Checks**
```typescript
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

3. **Graceful Shutdown**
```typescript
app.enableShutdownHooks();
```

## Observabilidad

### Logging

Cada servicio implementa logging:

```typescript
// API Gateway
logger.log(`[Proxy] ${method} ${url}`);

// Services
logger.error(`Error creating order: ${error.message}`);
```

### Métricas

Métricas a trackear:
- Request rate
- Error rate
- Latency (p50, p95, p99)
- Database query time
- Service availability

### Tracing

Para debugging distribuido:
- Correlation IDs
- Distributed tracing (Jaeger, Zipkin)
- Request path visualization

## Deployment

### Desarrollo

```bash
# Levantar servicios localmente
docker compose up -d postgres-*
npm run start:dev (en cada servicio)
```

### Staging/Production

Opciones de deployment:

1. **Docker Compose**
```bash
docker compose up -d
```

2. **Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: management-service
spec:
  replicas: 3
  ...
```

3. **Cloud Platforms**
- AWS ECS/EKS
- Google Cloud Run
- Azure Container Apps

## Mejoras Futuras

### Corto Plazo

1. ✅ Documentación completa
2. ⏳ Testing (unit + e2e)
3. ⏳ CI/CD pipeline
4. ⏳ Autenticación

### Mediano Plazo

1. Message Queue para comunicación async
2. Cache layer con Redis
3. API versioning
4. GraphQL API

### Largo Plazo

1. Event Sourcing
2. CQRS pattern
3. Service Mesh (Istio)
4. Multi-region deployment

## Conclusión

La arquitectura actual proporciona una base sólida para un sistema de facturación escalable y mantenible. La separación de responsabilidades permite que cada servicio evolucione independientemente, mientras que los patrones implementados garantizan consistencia y confiabilidad.
