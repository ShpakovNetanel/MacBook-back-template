import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { StockService } from './stock.service';

@Controller('/stocks')
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get('')
  async getUnitStocks(
    @Query('material') material: string,
    @Query('rootunit') rootUnit: number,
    @Req() request: Request,
  ) {
    return this.service.getMaterialStocks(
      rootUnit,
      request?.['date'],
      material,
    );
  }
}
