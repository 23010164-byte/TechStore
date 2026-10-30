import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}
  async findAll(q?: string, category?: string) {
    const qb = this.repo.createQueryBuilder('p');
    if (q) qb.andWhere('(p.name LIKE :q OR p.description LIKE :q)', { q: `%${q}%` });
    if (category) qb.andWhere('p.category = :category', { category });
    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }
  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Product not found');
    return item;
  }
  create(dto: ProductDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: number, dto: Partial<ProductDto>) { const p = await this.findOne(id); Object.assign(p, dto); return this.repo.save(p); }
  async remove(id: number) { const p = await this.findOne(id); await this.repo.remove(p); return { message: 'Product deleted' }; }
}
