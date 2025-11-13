import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      issuedDate: new Date(createInvoiceDto.issuedDate),
    });
    return await this.invoiceRepository.save(invoice);
  }

  async findAll(queryDto: QueryInvoicesDto) {
    const { orderId, startDate, endDate, page = 1, limit = 10 } = queryDto;
    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

    if (orderId) {
      queryBuilder.andWhere('invoice.orderId = :orderId', { orderId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('invoice.issuedDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('invoice.issuedDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('invoice.issuedDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    queryBuilder
      .orderBy('invoice.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [invoices, total] = await queryBuilder.getManyAndCount();

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    const updateData: any = { ...updateInvoiceDto };
    if (updateInvoiceDto.issuedDate) {
      updateData.issuedDate = new Date(updateInvoiceDto.issuedDate);
    }

    Object.assign(invoice, updateData);
    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }
}
