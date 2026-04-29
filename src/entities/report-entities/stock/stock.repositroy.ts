import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Stock } from './stock.model';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class StockRepository {
  constructor(@InjectModel(Stock) private readonly stockModel: typeof Stock) {}

  async getMaterialStock(
    materialId: string | string[] | undefined,
    units: number[],
  ) {
    const maxDates = await this.stockModel.findAll({
      attributes: [
        'materialId',
        'unitId',
        'stock_type',
        'grade',
        [Sequelize.fn('MAX', Sequelize.col('date')), 'maxDate'],
      ],
      where: { materialId, unitId: units },
      group: ['materialId', 'unitId', 'stock_type', 'grade'],
      raw: true,
    });

    if (!maxDates.length) return [];

    return await this.stockModel.findAll({
      where: {
        [Op.or]: maxDates.map((row: any) => ({
          materialId: row.materialId,
          unitId: row.unitId,
          stock_type: row.stock_type,
          grade: row.grade,
          date: row.maxDate,
        })),
      },
    });
  }
}
