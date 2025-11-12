import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { OrderStatus, InvoiceStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  trackingCode?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  invoiceStatus?: InvoiceStatus;
}
