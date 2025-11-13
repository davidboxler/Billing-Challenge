import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('invoices')
export class Invoice {
  @ApiProperty({
    description: 'Unique identifier of the invoice',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The ID of the order associated with this invoice',
    example: 1,
  })
  @Column({ type: 'int' })
  @Index('idx_order_id')
  orderId: number;

  @ApiProperty({
    description: 'The amount of the invoice',
    example: 150.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'The date when the invoice was issued',
    example: '2024-01-15T10:30:00Z',
  })
  @Column({ type: 'timestamp' })
  issuedDate: Date;

  @ApiProperty({
    description: 'Timestamp when the invoice was created',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the invoice was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
