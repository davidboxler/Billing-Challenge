import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    description: 'The updated amount of the invoice',
    example: 175.00,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'The updated date when the invoice was issued (ISO 8601 format)',
    example: '2024-01-20T10:30:00Z',
    type: String,
  })
  @IsDateString()
  @IsOptional()
  issuedDate?: string;
}
