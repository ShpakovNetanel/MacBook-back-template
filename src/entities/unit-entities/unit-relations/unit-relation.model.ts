import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Unit } from "../unit/unit.model";

export type IUnitRelation = {
  unitId: number;
  relatedUnitId: number;
  unitRelationId: number;
  unitObjectType: string;
  relatedUnitObjectType: string;
  startDate: Date;
  endDate: Date;
};

@Table({ tableName: "units_relations", timestamps: false })
export class UnitRelation extends Model<IUnitRelation> {
  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "related_unit_id", type: DataType.INTEGER })
  declare relatedUnitId: number;

  @PrimaryKey
  @Column({ field: "unit_relation_id", type: DataType.INTEGER })
  declare unitRelationId: number;

  @PrimaryKey
  @Column({ field: 'unit_object_type', type: DataType.STRING })
  declare unitObjectType: string;

  @PrimaryKey
  @Column({ field: 'related_unit_object_type', type: DataType.STRING })
  declare relatedUnitObjectType: string;

  @PrimaryKey
  @Column({ field: "start_date", type: DataType.DATE })
  declare startDate: Date;

  @Column({ field: "end_date", type: DataType.DATE })
  declare endDate: Date;

  @BelongsTo(() => Unit, { foreignKey: "unitId", as: "unit" })
  declare unit?: Unit;

  @BelongsTo(() => Unit, { foreignKey: "relatedUnitId", as: "relatedUnit" })
  declare relatedUnit?: Unit;
}
