import { IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryInvoicesDto {
  @ApiPropertyOptional({
    description: 'Filter invoices by order ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  orderId?: number;

  @ApiPropertyOptional({
    description: 'Filter invoices from this date (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter invoices up to this date (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    type: Number,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
