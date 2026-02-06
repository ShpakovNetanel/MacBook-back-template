import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Index,
} from "sequelize-typescript";
import { Unit } from "../unit/unit.model";

export type IUnitDetail = {
  unitId: number;
  startDate: Date;
  endDate: Date;

  objectType: string;
  description?: string | null;

  unitLevelId: number;
  unitTypeId?: number | null;
  tsavIrgunCodeId?: string | null;
};

@Table({ tableName: "units_details", timestamps: false })
export class UnitDetail extends Model<IUnitDetail> {
  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @Column({ field: "start_date", type: DataType.DATE })
  declare startDate: Date;

  @Column({ field: "end_date", type: DataType.DATE })
  declare endDate: Date;

  @Column({ field: "object_type", type: DataType.STRING(2) })
  declare objectType: string;

  @Column(DataType.STRING(255))
  declare description: string | null;

  @Column({ field: "level_id", type: DataType.INTEGER })
  declare unitLevelId: number;

  @Column({ field: "unit_type_id", type: DataType.INTEGER })
  declare unitTypeId: number | null;

  @Column({ field: "tsav_irgun_code", type: DataType.STRING(10) })
  declare tsavIrgunCodeId: string | null;

  @BelongsTo(() => Unit)
  declare unit?: Unit;
}
