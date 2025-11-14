# Database Documentation

## Overview

Este proyecto utiliza PostgreSQL como sistema de gestión de base de datos. Se implementan dos bases de datos separadas para seguir el patrón de microservicios:

- **managementdb**: Base de datos del Management Service (Orders)
- **invoicedb**: Base de datos del Invoice Service (Invoices)

## Schema

### Management Service - Orders Table

**Tabla:** `orders`

| Columna | Tipo | Descripción | Índice |
|---------|------|-------------|---------|
| id | INTEGER | Primary Key, auto-incremental | PK |
| customerName | VARCHAR(255) | Nombre del cliente | - |
| trackingCode | VARCHAR(100) | Código único de seguimiento | idx_tracking_code |
| status | ENUM | Estado de la orden (ACTIVE, INACTIVE) | idx_status |
| invoiceStatus | ENUM | Estado de facturación (PENDING, INVOICED) | idx_invoice_status |
| createdAt | TIMESTAMP | Fecha de creación | idx_created_at |
| updatedAt | TIMESTAMP | Fecha de última actualización | - |
| deletedAt | TIMESTAMP | Fecha de eliminación (soft delete) | - |

**Enums:**
- `OrderStatus`: ACTIVE, INACTIVE
- `InvoiceStatus`: PENDING, INVOICED

**Índices implementados:**
- `idx_tracking_code`: Para búsquedas rápidas por código de seguimiento
- `idx_status`: Para filtrado por estado de orden
- `idx_invoice_status`: Para filtrado por estado de facturación
- `idx_created_at`: Para ordenamiento y filtrado por fecha

### Invoice Service - Invoices Table

**Tabla:** `invoices`

| Columna | Tipo | Descripción | Índice |
|---------|------|-------------|---------|
| id | INTEGER | Primary Key, auto-incremental | PK |
| orderId | INTEGER | ID de la orden asociada | idx_order_id |
| amount | DECIMAL(10,2) | Monto de la factura | - |
| issuedDate | TIMESTAMP | Fecha de emisión | - |
| trackingCode | VARCHAR(255) | Código único de seguimiento (idempotencia) | idx_tracking_code (unique) |
| author | VARCHAR(255) | Autor que creó la factura | - |
| createdAt | TIMESTAMP | Fecha de creación | - |
| updatedAt | TIMESTAMP | Fecha de última actualización | - |

**Índices implementados:**
- `idx_tracking_code`: Índice único para idempotencia
- `idx_order_id`: Para búsquedas rápidas por ID de orden

## Database Optimization

Los índices han sido implementados estratégicamente para optimizar las consultas más frecuentes:

1. **Búsqueda por tracking code**: Ambas tablas tienen índice en `trackingCode`
2. **Filtrado por estados**: Orders tiene índices en `status` y `invoiceStatus`
3. **Ordenamiento temporal**: Orders tiene índice en `createdAt`
4. **Relación Orders-Invoices**: Invoices tiene índice en `orderId`

## Seeds

### Descripción

Se han creado archivos de seed para poblar las bases de datos con datos de prueba. Los seeds incluyen:

- **Orders**: 10 órdenes con diferentes estados y clientes
- **Invoices**: 8 facturas asociadas a las órdenes creadas

### Uso

#### Management Service

```bash
cd management-service
npm run seed
```

Este comando:
1. Limpia la tabla `orders`
2. Inserta 10 órdenes de ejemplo
3. Muestra confirmación del número de registros creados

#### Invoice Service

```bash
cd invoice-service
npm run seed
```

Este comando:
1. Limpia la tabla `invoices`
2. Inserta 8 facturas de ejemplo
3. Muestra confirmación del número de registros creados

### Datos de Ejemplo

#### Orders

Los datos incluyen variedad de:
- Estados: ACTIVE, INACTIVE
- Estados de facturación: PENDING, INVOICED
- Clientes con nombres hispanos
- Códigos de tracking en formato ORD-YYYY-NNN

#### Invoices

Los datos incluyen:
- Diferentes montos (desde $125.75 hasta $500.00)
- Fechas de emisión distribuidas en el tiempo
- Asociaciones con órdenes existentes
- Códigos de tracking en formato INV-YYYY-NNN

## Conexión a Base de Datos

Las credenciales se configuran mediante variables de entorno:

### Management Service
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=managementdb
```

### Invoice Service
```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=invoicedb
```

## Docker Compose

Las bases de datos se ejecutan en contenedores Docker definidos en `docker-compose.yml`:

```bash
# Iniciar todas las bases de datos
docker compose up -d postgres-management postgres-invoice

# Ver logs
docker compose logs -f postgres-management
docker compose logs -f postgres-invoice

# Detener
docker compose down
```

## Migraciones

Actualmente el proyecto usa `synchronize: true` en desarrollo, lo que crea automáticamente las tablas basándose en las entidades TypeORM.

Para producción, se recomienda:
1. Desactivar `synchronize`
2. Usar migraciones de TypeORM
3. Scripts disponibles en package.json:
   - `npm run migration:generate`
   - `npm run migration:run`
   - `npm run migration:revert`

## Consideraciones de Seguridad

1. Las contraseñas en archivos `.env` son solo para desarrollo
2. En producción, usar variables de entorno seguras
3. Los índices únicos previenen duplicación de datos
4. El soft delete (deletedAt) preserva datos históricos
