import {
  BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table
} from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { Report } from "../report/report.model";

export type IReportItem = {
  reportId: number;
  materialId: string;
  reportingLevel: number;
  reportingUnitId: number;
  reportingUnitObjectType: string;
  reportedQuantity?: number | null;
  confirmedQuantity?: number | null;
  balanceQuantity?: number | null;
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

  @ForeignKey(() => UnitId)
  @Column({ field: "reporting_unit", type: DataType.INTEGER })
  declare reportingUnitId: number;

  @Column({ field: "reporting_unit_object_type", type: DataType.STRING(2) })
  declare reportingUnitObjectType: string;

  @Column({ field: "reported_quantity", type: DataType.DECIMAL })
  declare reportedQuantity: string | null;

  @Column({ field: "confirmed_quantity", type: DataType.DECIMAL })
  declare confirmedQuantity: string | null;

  @Column({ field: "balance_quantity", type: DataType.DECIMAL })
  declare balanceQuantity: string | null;

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
  @BelongsTo(() => StandardGroup, { foreignKey: "materialId", constraints: false }) declare standardGroup?: StandardGroup;
  @BelongsTo(() => UnitId, { foreignKey: "reportingUnitId" }) declare reportingUnit?: UnitId;
}
