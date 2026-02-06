import {
  BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table
} from "sequelize-typescript";
import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { Report } from "../report/report.model";

export type IReportItem = {
  reportId: number;
  materialId: string;
  reportingLevel: number;
  reportingUnitId: number;
  reportedQuantity?: string | number | null;
  confirmedQuantity?: string | number | null;
  status?: string | null;
  changedAt?: string | null;
  changedBy?: string | null;
  modifiedAt?: Date | null;
};

@Table({ tableName: "report_items", timestamps: false })
export class ReportItem extends Model<IReportItem> {
  @PrimaryKey
  @ForeignKey(() => Report)
  @Column({ field: "report_id", type: DataType.INTEGER })
  declare reportId: number;

  @PrimaryKey
  @ForeignKey(() => Material)
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @PrimaryKey
  @Column({ field: "reporting_level", type: DataType.INTEGER })
  declare reportingLevel: number;

  @ForeignKey(() => Unit)
  @Column({ field: "reporting_unit", type: DataType.INTEGER })
  declare reportingUnitId: number;

  @Column({ field: "reported_quantity", type: DataType.DECIMAL })
  declare reportedQuantity: string | null;

  @Column({ field: "confirmed_quantity", type: DataType.DECIMAL })
  declare confirmedQuantity: string | null;

  @Column(DataType.STRING(20))
  declare status: string | null;

  @Column({ field: "changed_at", type: DataType.TIME })
  declare changedAt: string | null;

  @Column({ field: "changed_by", type: DataType.STRING(20) })
  declare changedBy: string | null;

  @Column({ field: "modified_at", type: DataType.DATE })
  declare modifiedAt: Date | null;

  @BelongsTo(() => Report) declare report?: Report;
  @BelongsTo(() => Material) declare material?: Material;
  @BelongsTo(() => Unit, { foreignKey: "reportingUnitId" }) declare reportingUnit?: Unit;
}
