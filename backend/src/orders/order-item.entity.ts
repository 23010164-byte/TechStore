import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'order_id' }) orderId: number;
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'order_id' }) order: Order;
  @Column({ name: 'product_id' }) productId: number;
  @ManyToOne(() => Product) @JoinColumn({ name: 'product_id' }) product: Product;
  @Column({ name: 'product_name', length: 180 }) productName: string;
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 }) unitPrice: string;
  @Column() quantity: number;
}
