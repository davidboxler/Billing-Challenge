import { IsNumber, IsNotEmpty, IsDateString, Min } from 'class-validator';
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
}
