import { DataSource } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';

export async function seedInvoices(dataSource: DataSource): Promise<void> {
  const invoiceRepository = dataSource.getRepository(Invoice);

  // Clear existing data
  await invoiceRepository.clear();

  const invoices = [
    {
      orderId: 2,
      amount: 150.50,
      issuedDate: new Date('2024-01-10'),
      trackingCode: 'INV-2024-001',
      author: 'María García',
    },
    {
      orderId: 5,
      amount: 299.99,
      issuedDate: new Date('2024-01-15'),
      trackingCode: 'INV-2024-002',
      author: 'Pedro Rodríguez',
    },
    {
      orderId: 7,
      amount: 450.00,
      issuedDate: new Date('2024-01-18'),
      trackingCode: 'INV-2024-003',
      author: 'Diego Sánchez',
    },
    {
      orderId: 8,
      amount: 125.75,
      issuedDate: new Date('2024-01-20'),
      trackingCode: 'INV-2024-004',
      author: 'Sofia Torres',
    },
    {
      orderId: 1,
      amount: 200.00,
      issuedDate: new Date('2024-01-22'),
      trackingCode: 'INV-2024-005',
      author: 'Juan Pérez',
    },
    {
      orderId: 3,
      amount: 350.25,
      issuedDate: new Date('2024-01-25'),
      trackingCode: 'INV-2024-006',
      author: 'Carlos López',
    },
    {
      orderId: 6,
      amount: 175.50,
      issuedDate: new Date('2024-01-28'),
      trackingCode: 'INV-2024-007',
      author: 'Laura Fernández',
    },
    {
      orderId: 9,
      amount: 500.00,
      issuedDate: new Date('2024-02-01'),
      trackingCode: 'INV-2024-008',
      author: 'Miguel Ramírez',
    },
  ];

  const createdInvoices = [];
  for (const invoiceData of invoices) {
    const invoice = invoiceRepository.create(invoiceData);
    const savedInvoice = await invoiceRepository.save(invoice);
    createdInvoices.push(savedInvoice);
  }

  console.log(`✅ Created ${createdInvoices.length} invoices`);
}
