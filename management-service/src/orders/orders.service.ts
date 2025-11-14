import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus, InvoiceStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { InvoiceOrdersDto } from './dto/invoice-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    await this.validateUniqueTrackingCode(createOrderDto.trackingCode);

    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async findAll(queryDto: QueryOrdersDto) {
    const {
      search,
      customerName,
      trackingCode,
      status,
      invoiceStatus,
      createdFrom,
      createdTo,
      page,
      limit,
      sortBy,
      sortDir,
    } = queryDto;

    const query = this.orderRepository.createQueryBuilder('order');

    query.where('order.deletedAt IS NULL');

    if (search) {
      query.andWhere(
        '(order.customerName ILIKE :search OR order.trackingCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (customerName) {
      query.andWhere('order.customerName ILIKE :customerName', {
        customerName: `%${customerName}%`,
      });
    }

    if (trackingCode) {
      query.andWhere('order.trackingCode ILIKE :trackingCode', {
        trackingCode: `%${trackingCode}%`,
      });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (invoiceStatus) {
      query.andWhere('order.invoiceStatus = :invoiceStatus', {
        invoiceStatus,
      });
    }

    if (createdFrom) {
      query.andWhere('order.createdAt >= :createdFrom', { createdFrom });
    }

    if (createdTo) {
      query.andWhere('order.createdAt <= :createdTo', { createdTo });
    }

    query.orderBy(`order.${sortBy}`, sortDir);

    const pageValue = page || 1;
    const limitValue = limit || 10;

    query.skip((pageValue - 1) * limitValue);
    query.take(limitValue);

    const [items, total] = await query.getManyAndCount();

    const hasNext = pageValue * limitValue < total;

    return {
      items,
      total,
      page: pageValue,
      limit: limitValue,
      hasNext,
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (updateOrderDto.trackingCode && updateOrderDto.trackingCode !== order.trackingCode) {
      await this.validateUniqueTrackingCode(updateOrderDto.trackingCode, id);
    }

    if (updateOrderDto.invoiceStatus) {
      this.validateInvoiceStatusTransition(
        order.invoiceStatus,
        updateOrderDto.invoiceStatus,
      );
    }

    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);

    if (order.deletedAt) {
      return;
    }

    order.deletedAt = new Date();
    order.status = OrderStatus.INACTIVE;
    await this.orderRepository.save(order);
  }

  private async validateUniqueTrackingCode(
    trackingCode: string,
    excludeId?: number,
  ): Promise<void> {
    const query = this.orderRepository.createQueryBuilder('order');

    query.where('order.trackingCode = :trackingCode', { trackingCode });
    query.andWhere('order.status = :status', { status: OrderStatus.ACTIVE });
    query.andWhere('order.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('order.id != :excludeId', { excludeId });
    }

    const existingOrder = await query.getOne();

    if (existingOrder) {
      throw new ConflictException(
        `Tracking code '${trackingCode}' is already in use by an active order`,
      );
    }
  }

  private validateInvoiceStatusTransition(
    currentStatus: InvoiceStatus,
    newStatus: InvoiceStatus,
  ): void {
    if (
      currentStatus === InvoiceStatus.INVOICED &&
      newStatus === InvoiceStatus.PENDING
    ) {
      throw new BadRequestException(
        'Cannot revert invoice status from INVOICED to PENDING',
      );
    }
  }

  async invoiceOrders(invoiceOrdersDto: InvoiceOrdersDto) {
    const { orderIds } = invoiceOrdersDto;

    // Find all orders by IDs
    const orders = await this.orderRepository.find({
      where: {
        id: In(orderIds),
        deletedAt: IsNull(),
      },
    });

    // Validate that all orders exist
    if (orders.length !== orderIds.length) {
      const foundIds = orders.map((order) => order.id);
      const missingIds = orderIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Orders with IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Validate that all orders are ACTIVE and PENDING
    const invalidOrders = orders.filter(
      (order) =>
        order.status !== OrderStatus.ACTIVE ||
        order.invoiceStatus !== InvoiceStatus.PENDING,
    );

    if (invalidOrders.length > 0) {
      const invalidIds = invalidOrders.map((order) => order.id);
      throw new BadRequestException(
        `Orders with IDs ${invalidIds.join(', ')} are not eligible for invoicing. They must be ACTIVE and PENDING`,
      );
    }

    // Prepare invoice data for Invoice Service
    const invoiceServiceUrl = this.configService.get<string>(
      'INVOICE_SERVICE_URL',
    );

    try {
      // Create invoices for each order
      const invoicePromises = orders.map((order) => {
        const invoiceData = {
          orderId: order.id,
          amount: 100.0, // Dummy amount for now
          issuedDate: new Date().toISOString(),
          trackingCode: order.trackingCode,
          author: 'Management Service',
        };
        return firstValueFrom(
          this.httpService.post(`${invoiceServiceUrl}/invoices`, invoiceData),
        );
      });

      // Wait for all invoices to be created
      const invoiceResponses = await Promise.all(invoicePromises);

      // Update order invoice status to INVOICED
      await this.orderRepository.update(
        { id: In(orderIds) },
        { invoiceStatus: InvoiceStatus.INVOICED },
      );

      return {
        message: 'Orders invoiced successfully',
        invoiceIds: invoiceResponses.map((res) => res.data.id),
        invoicedOrders: orderIds,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create invoice: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
