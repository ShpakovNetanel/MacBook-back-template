import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

export type IUnitStatusType = {
  id: number;
  description: string;
};

@Table({ tableName: "unit_status_types", timestamps: false })
export class UnitStatusType extends Model<IUnitStatusType> {
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  declare description: string;
}
