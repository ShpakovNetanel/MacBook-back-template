import {
  BelongsTo, Column, DataType,
  HasMany, Model, PrimaryKey, Table
} from "sequelize-typescript";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { ReportItem } from "../report-item/report-item.model";

export type IReport = {
  id?: number;
  reportTypeId: number;
  unitId: number;
  unitObjectType: string;
  recipientUnitId: number | null;
  recipientUnitObjectType: string;
  reporterUnitId?: number | null;
  reporterUnitObjectType: string;
  createdOn?: Date | null;
  createdAt?: string | null;
  createdBy: string | null;
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

  @Column({ field: "unit_object_type", type: DataType.STRING(2) })
  declare unitObjectType: string;

  @Column({ field: "recipient_unit_id", type: DataType.INTEGER })
  declare recipientUnitId: number | null;

  @Column({ field: "recipient_unit_object_type", type: DataType.STRING(2) })
  declare recipientUnitObjectType: string;

  @Column({ field: "reporter_unit_id", type: DataType.INTEGER })
  declare reporterUnitId: number | null;

  @Column({ field: "reporter_unit_object_type", type: DataType.STRING(2) })
  declare reporterUnitObjectType: string;

  @Column({ field: "created_on", type: DataType.DATE })
  declare createdOn: Date | null;

  @Column({ field: "created_at", type: DataType.TIME })
  declare createdAt: string | null;

  @Column({ field: "created_by", type: DataType.STRING(20) })
  declare createdBy: string | null;

  @BelongsTo(() => UnitId, { foreignKey: "unitId", as: "unit" }) declare unit?: UnitId;
  @BelongsTo(() => UnitId, { foreignKey: "recipientUnitId", as: "recipientUnit" }) declare recipientUnit?: UnitId;
  @BelongsTo(() => UnitId, { foreignKey: "reporterUnitId", as: "reporterUnit" }) declare reporterUnit?: UnitId;

  @HasMany(() => ReportItem) declare items?: ReportItem[];
}
