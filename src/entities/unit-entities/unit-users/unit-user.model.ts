import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

export type IUnitUser = {
  userId: number;
  unitId: number;
  startDate: Date;
  endDate: Date;
};

@Table({ tableName: "unit_users", timestamps: false })
export class UnitUser extends Model<IUnitUser> {
  @PrimaryKey
  @Column({ field: "user_id", type: DataType.INTEGER })
  declare userId: number;

  @PrimaryKey
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @Column({ field: "start_date", type: DataType.DATE })
  declare startDate: Date;

  @Column({ field: "end_date", type: DataType.DATE })
  declare endDate: Date;
}
