import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Unit } from "../unit/unit.model";
import { UnitStatus } from "../units-statuses/units-statuses.model";

export type IUnitId = {
  id: number;
};

@Table({ tableName: "units_ids", timestamps: false })
export class UnitId extends Model<IUnitId> {
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @HasMany(() => Unit, { foreignKey: "unitId" })
  declare details?: Unit[];

  @HasMany(() => UnitStatus, { foreignKey: "unitId" })
  declare unitStatus?: UnitStatus[];

  get activeDetail(): Unit | undefined {
    return this.details?.[0];
  }
}
