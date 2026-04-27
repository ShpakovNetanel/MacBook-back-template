import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

export type IUser = {
  id: string;
  unitId: number;
  name: string;
};

@Table({ tableName: "users", timestamps: false })
export class User extends Model<IUser> {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare id: string;

  @PrimaryKey
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @Column({ type: DataType.STRING })
  declare name: string;

}
