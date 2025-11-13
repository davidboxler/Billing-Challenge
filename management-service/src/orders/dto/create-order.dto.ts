import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Name of the customer',
    example: 'Juan Pérez',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  customerName: string;

  @ApiProperty({
    description: 'Unique tracking code for the order (must be unique among active orders)',
    example: 'ORD-2024-001',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  trackingCode: string;
}
