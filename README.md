# Sistema de Facturación - Microservicios

Sistema de gestión de órdenes y facturación basado en arquitectura de microservicios.

## Arquitectura

- **API Gateway** (puerto 3000): Punto de entrada único
- **Management Service** (puerto 3001): Gestión de órdenes
- **Invoice Service** (puerto 3002): Gestión de facturas
- **PostgreSQL** (puertos 5432, 5433): Bases de datos independientes

## Estructura del Proyecto

```
billing-challenge/
├── api-gateway/          # Gateway principal
├── management-service/   # Servicio de órdenes
├── invoice-service/      # Servicio de facturas
└── docker-compose.yml    # Orquestación de servicios
```

## Setup Local

### Prerequisitos

- Node.js 20+
- Docker y Docker Compose
- npm

### Instalación

1. Levantar las bases de datos:
```bash
docker-compose up -d management-db invoice-db
```

2. Instalar dependencias en cada servicio:
```bash
cd management-service && npm install
cd ../invoice-service && npm install
cd ../api-gateway && npm install
```

3. Ejecutar servicios en modo desarrollo:
```bash
# Terminal 1
cd management-service && npm run start:dev

# Terminal 2
cd invoice-service && npm run start:dev

# Terminal 3
cd api-gateway && npm run start:dev
```

## Estado del Desarrollo

- [x] Estructura base del proyecto
- [x] Configuración Docker
- [x] Inicialización servicios NestJS
- [ ] Implementación Management Service
- [ ] Implementación Invoice Service
- [ ] Comunicación entre microservicios
- [ ] API Gateway routing

## Variables de Entorno

Cada servicio tiene su archivo `.env` con la configuración correspondiente.
