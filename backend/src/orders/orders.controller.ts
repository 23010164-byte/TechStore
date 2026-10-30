  import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
  import { OrdersService } from './orders.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';

  @Controller('orders')
  @UseGuards(JwtAuthGuard)
  export class OrdersController {
    constructor(private orders: OrdersService) {}
    @Post() create(@Req() req: any, @Body() body: { shippingAddress: string; items: { productId: number; quantity: number }[] }) { return this.orders.create(req.user.userId, body); }
    @Get('mine') findMine(@Req() req: any) { return this.orders.findMine(req.user.userId); }
    @Get() @UseGuards(RolesGuard) @Roles('admin') findAll() { return this.orders.findAll(); }
    @Patch(':id/status') @UseGuards(RolesGuard) @Roles('admin') updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) { return this.orders.updateStatus(id, status); }
  }
