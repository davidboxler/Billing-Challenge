import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, InvoiceStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Updated name of the customer',
    example: 'María González',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Updated tracking code (must remain unique among active orders)',
    example: 'ORD-2024-002',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  trackingCode?: string;

  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Invoice status (cannot revert from INVOICED to PENDING)',
    enum: InvoiceStatus,
    example: InvoiceStatus.INVOICED,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  invoiceStatus?: InvoiceStatus;
}
