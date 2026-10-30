import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}
  @Get() findAll(@Query('q') q?: string, @Query('category') category?: string) { return this.products.findAll(q, category); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.products.findOne(id); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') create(@Body() dto: ProductDto) { return this.products.create(dto); }
  @Patch(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<ProductDto>) { return this.products.update(id, dto); }
  @Delete(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') remove(@Param('id', ParseIntPipe) id: number) { return this.products.remove(id); }
}
