import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'full_name', length: 120 }) fullName: string;
  @Column({ unique: true, length: 190 }) email: string;
  @Column({ name: 'password_hash', select: false }) passwordHash: string;
  @Column({ type: 'enum', enum: ['customer', 'admin'], default: 'customer' }) role: 'customer' | 'admin';
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
