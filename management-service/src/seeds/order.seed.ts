import { DataSource } from 'typeorm';
import { Order, OrderStatus, InvoiceStatus } from '../orders/entities/order.entity';

export async function seedOrders(dataSource: DataSource): Promise<void> {
  const orderRepository = dataSource.getRepository(Order);

  // Clear existing data
  await orderRepository.clear();

  const orders = [
    {
      customerName: 'Juan Pérez',
      trackingCode: 'ORD-2024-001',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.PENDING,
    },
    {
      customerName: 'María García',
      trackingCode: 'ORD-2024-002',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.INVOICED,
    },
    {
      customerName: 'Carlos López',
      trackingCode: 'ORD-2024-003',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.PENDING,
    },
    {
      customerName: 'Ana Martínez',
      trackingCode: 'ORD-2024-004',
      status: OrderStatus.INACTIVE,
      invoiceStatus: InvoiceStatus.PENDING,
    },
    {
      customerName: 'Pedro Rodríguez',
      trackingCode: 'ORD-2024-005',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.INVOICED,
    },
    {
      customerName: 'Laura Fernández',
      trackingCode: 'ORD-2024-006',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.PENDING,
    },
    {
      customerName: 'Diego Sánchez',
      trackingCode: 'ORD-2024-007',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.INVOICED,
    },
    {
      customerName: 'Sofia Torres',
      trackingCode: 'ORD-2024-008',
      status: OrderStatus.INACTIVE,
      invoiceStatus: InvoiceStatus.INVOICED,
    },
    {
      customerName: 'Miguel Ramírez',
      trackingCode: 'ORD-2024-009',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.PENDING,
    },
    {
      customerName: 'Valentina Castro',
      trackingCode: 'ORD-2024-010',
      status: OrderStatus.ACTIVE,
      invoiceStatus: InvoiceStatus.PENDING,
    },
  ];

  const createdOrders = [];
  for (const orderData of orders) {
    const order = orderRepository.create(orderData);
    const savedOrder = await orderRepository.save(order);
    createdOrders.push(savedOrder);
  }

  console.log(`✅ Created ${createdOrders.length} orders`);
}
