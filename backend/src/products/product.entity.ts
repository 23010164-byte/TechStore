import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 180 }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ length: 80 }) category: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) price: string;
  @Column({ default: 0 }) stock: number;
  @Column({ name: 'image_url', length: 500, nullable: true }) imageUrl: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
