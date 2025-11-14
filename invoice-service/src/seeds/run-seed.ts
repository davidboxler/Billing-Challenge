import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { seedInvoices } from './invoice.seed';

config();

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'invoicedb',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
};

const dataSource = new DataSource(options);

async function runSeed() {
  try {
    console.log('🌱 Starting seed...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    await seedInvoices(dataSource);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
