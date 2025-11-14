import { IsNumber, IsNotEmpty, IsDateString, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'The ID of the order associated with this invoice',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({
    description: 'The amount of the invoice',
    example: 150.50,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'The date when the invoice was issued (ISO 8601 format)',
    example: '2024-01-15T10:30:00Z',
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  issuedDate: string;

  @ApiProperty({
    description: 'Unique tracking code for the invoice (for idempotency)',
    example: 'TRK-001',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  trackingCode: string;

  @ApiProperty({
    description: 'Author who created the invoice',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  author: string;
}
