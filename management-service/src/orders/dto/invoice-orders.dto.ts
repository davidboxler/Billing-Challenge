import { IsArray, ArrayNotEmpty, ArrayMinSize, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InvoiceOrdersDto {
  @ApiProperty({
    description: 'Array of order IDs to invoice',
    example: [1, 2, 3],
    type: [Number],
    isArray: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  orderIds: number[];
}
