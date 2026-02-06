import {
  BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table
} from "sequelize-typescript";
import { ReportItem } from "../report-item/report-item.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";

export type IReport = {
  id?: number;
  reportTypeId: number;
  unitId: number;
  recipientUnitId: number;
  reporterUnitId?: number | null;
  createdOn?: Date | null;
  createdAt?: string | null;
  createdBy: string;
};

@Table({ tableName: "reports", timestamps: false })
export class Report extends Model<IReport> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  declare id: number;

  @Column({ field: "report_type_id", type: DataType.INTEGER })
  declare reportTypeId: number;

  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @Column({ field: "recipient_unit_id", type: DataType.INTEGER })
  declare recipientUnitId: number;

  @Column({ field: "reporter_unit_id", type: DataType.INTEGER })
  declare reporterUnitId: number | null;

  @Column({ field: "created_on", type: DataType.DATE })
  declare createdOn: Date | null;

  @Column({ field: "created_at", type: DataType.TIME })
  declare createdAt: string | null;

  @Column({ field: "created_by", type: DataType.STRING(20) })
  declare createdBy: string;

  @BelongsTo(() => Unit, { foreignKey: "unitId", as: "unit" }) declare unit?: Unit;
  @BelongsTo(() => Unit, { foreignKey: "recipientUnitId", as: "recipientUnit" }) declare recipientUnit?: Unit;
  @BelongsTo(() => Unit, { foreignKey: "reporterUnitId", as: "reporterUnit" }) declare reporterUnit?: Unit;

  @HasMany(() => ReportItem) declare items?: ReportItem[];
}
