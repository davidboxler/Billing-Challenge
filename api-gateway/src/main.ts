import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Proxy configuration for Management Service
  const managementServiceUrl = process.env.MANAGEMENT_SERVICE_URL || 'http://localhost:3001';
  app.use(
    '/orders',
    createProxyMiddleware({
      target: managementServiceUrl,
      changeOrigin: true,
      pathRewrite: (path, req) => `/orders${path}`, // Re-add the /orders prefix
      on: {
        proxyReq: (proxyReq, req, res) => {
          logger.log(`[Proxy] ${req.method} /orders${req.url} -> ${managementServiceUrl}/orders${req.url}`);
        },
        error: (err, req, res) => {
          logger.error(`[Proxy Error] ${err.message}`);
        },
      },
    }),
  );

  // Proxy configuration for Invoice Service
  const invoiceServiceUrl = process.env.INVOICE_SERVICE_URL || 'http://localhost:3002';
  app.use(
    '/invoices',
    createProxyMiddleware({
      target: invoiceServiceUrl,
      changeOrigin: true,
      pathRewrite: (path, req) => `/invoices${path}`, // Re-add the /invoices prefix
      on: {
        proxyReq: (proxyReq, req, res) => {
          logger.log(`[Proxy] ${req.method} /invoices${req.url} -> ${invoiceServiceUrl}/invoices${req.url}`);
        },
        error: (err, req, res) => {
          logger.error(`[Proxy Error] ${err.message}`);
        },
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API Gateway running on port ${port}`);
  logger.log(`Proxying /orders/* to ${managementServiceUrl}`);
  logger.log(`Proxying /invoices/* to ${invoiceServiceUrl}`);
}
bootstrap();
