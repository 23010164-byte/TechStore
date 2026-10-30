import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(OrderItem) private items: Repository<OrderItem>,
    @InjectRepository(Product) private products: Repository<Product>,
  ) {}
  async create(userId: number, body: { shippingAddress: string; items: { productId: number; quantity: number }[] }) {
    if (!body.shippingAddress?.trim() || !body.items?.length) throw new BadRequestException('Shipping address and items are required');
    return this.dataSource.transaction(async manager => {
      let total = 0;
      const lines: Partial<OrderItem>[] = [];
      for (const line of body.items) {
        if (!Number.isInteger(line.quantity) || line.quantity < 1) throw new BadRequestException('Quantity must be a positive integer');
        const product = await manager.findOne(Product, { where: { id: line.productId }, lock: { mode: 'pessimistic_write' } });
        if (!product) throw new NotFoundException(`Product ${line.productId} not found`);
        if (product.stock < line.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
        const price = Number(product.price);
        total += price * line.quantity;
        product.stock -= line.quantity;
        await manager.save(product);
        lines.push({ productId: product.id, productName: product.name, unitPrice: product.price, quantity: line.quantity });
      }
      const order = manager.create(Order, { userId, shippingAddress: body.shippingAddress, total: total.toFixed(2), status: 'pending' });
      order.items = lines as OrderItem[];
      return manager.save(order);
    });
  }
  findMine(userId: number) { return this.orders.find({ where: { userId }, relations: ['items'], order: { createdAt: 'DESC' } }); }
  findAll() { return this.orders.find({ relations: ['items'], order: { createdAt: 'DESC' } }); }
  async updateStatus(id: number, status: string) {
    const allowed = ['pending','confirmed','shipping','completed','cancelled'];
    if (!allowed.includes(status)) throw new BadRequestException('Invalid status');
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orders.save(order);
  }
}
