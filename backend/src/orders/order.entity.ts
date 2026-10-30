import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'user_id' }) userId: number;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;
  @Column({ type: 'enum', enum: ['pending','confirmed','shipping','completed','cancelled'], default: 'pending' }) status: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) total: string;
  @Column({ name: 'shipping_address', length: 500 }) shippingAddress: string;
  @OneToMany(() => OrderItem, item => item.order, { cascade: true }) items: OrderItem[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
