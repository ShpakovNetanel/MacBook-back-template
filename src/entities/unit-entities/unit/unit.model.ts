import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UnitDetail } from "../unit-details/unit-details.model";
import { UnitStatusTypes } from "../units-statuses/units-statuses.model";

export type IUnit = {
  id: number;
  simul?: string | null;
};

@Table({ tableName: "units", timestamps: false })
export class Unit extends Model<IUnit> {
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ field: "simul", type: DataType.STRING })
  declare simul: string | null;

  @HasMany(() => UnitDetail, { foreignKey: "unitId" })
  declare details?: UnitDetail[];

  @HasMany(() => UnitStatusTypes, { foreignKey: "unitId" })
  declare unitStatusHistory?: UnitStatusTypes[];
  
  get activeDetail(): UnitDetail | undefined {
    return this.details?.[0];
  }
}
