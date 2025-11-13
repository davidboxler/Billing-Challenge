import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  INVOICED = 'INVOICED',
}

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'Unique identifier of the order',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the customer',
    example: 'Juan Pérez',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  customerName: string;

  @ApiProperty({
    description: 'Unique tracking code (unique among active orders)',
    example: 'ORD-2024-001',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  @Index('idx_tracking_code')
  trackingCode: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.ACTIVE,
    default: OrderStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ACTIVE,
  })
  @Index('idx_status')
  status: OrderStatus;

  @ApiProperty({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING,
    default: InvoiceStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  @Index('idx_invoice_status')
  invoiceStatus: InvoiceStatus;

  @ApiProperty({
    description: 'Timestamp when the order was created',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  @Index('idx_created_at')
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the order was soft deleted (null if not deleted)',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
