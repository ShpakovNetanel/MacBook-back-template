import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UnitStatusType } from "../unit-status-type/unit-status-type.model";
import { UnitId } from "../unit-id/unit-id.model";

export type IUnitStatus = {
  unitId: number;
  unitStatusId: number;
  date: Date;
};

@Table({ tableName: "units_statuses", timestamps: false })
export class UnitStatus extends Model<IUnitStatus> {
  @PrimaryKey
  @ForeignKey(() => UnitId)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @Column({ field: "date", type: DataType.DATE })
  declare date: Date;

  @Column({ field: "unit_status_id", type: DataType.INTEGER })
  declare unitStatusId: number;

  @BelongsTo(() => UnitStatusType, { foreignKey: "unitStatusId", as: "unitStatus" })
  declare unitStatus?: UnitStatusType;

  @BelongsTo(() => UnitId, { foreignKey: 'unitId'})
  declare unit?: UnitId
}
