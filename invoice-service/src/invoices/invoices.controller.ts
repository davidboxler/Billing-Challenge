import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body(ValidationPipe) createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with optional filters' })
  @ApiResponse({ status: 200, description: 'List of invoices with pagination' })
  findAll(@Query(ValidationPipe) queryDto: QueryInvoicesDto) {
    return this.invoicesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: Number })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: Number })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: Number })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.remove(id);
  }
}
