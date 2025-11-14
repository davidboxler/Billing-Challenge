import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Idempotency check: if an invoice with the same trackingCode exists, return it
    const existingInvoice = await this.invoiceRepository.findOne({
      where: { trackingCode: createInvoiceDto.trackingCode },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      issuedDate: new Date(createInvoiceDto.issuedDate),
    });
    return await this.invoiceRepository.save(invoice);
  }

  async findAll(queryDto: QueryInvoicesDto) {
    const {
      orderId,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortDir = 'DESC',
      page = 1,
      limit = 10,
    } = queryDto;
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

    if (search) {
      queryBuilder.andWhere(
        '(invoice.trackingCode ILIKE :search OR invoice.author ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`invoice.${sortBy}`, sortDir as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    const hasNext = page * limit < total;

    return {
      items,
      total,
      page,
      limit,
      hasNext,
    };
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }
}
