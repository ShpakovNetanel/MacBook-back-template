import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitHierarchyController } from "./unit-hierarchy.controller";
import { UnitHierarchyService } from "./unit-hierarchy.service";
import { UnitHierarchyRepository } from "./unit-hierarchy.repository";
import { Unit } from "../../unit/unit.model";
import { UnitDetail } from "../../unit-details/unit-details.model";
import { UnitRelation } from "../../unit-relations/unit-relation.model";
import { UnitStatusType } from "../../unit-status-type/unit-status-type.model";
import { UnitUser } from "../../unit-users/unit-user.model";
import { UnitStatusTypes } from "../../units-statuses/units-statuses.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Unit,
      UnitDetail,
      UnitRelation,
      UnitStatusType,
      UnitUser,
      UnitStatusTypes,
    ]),
  ],
  controllers: [UnitHierarchyController],
  providers: [UnitHierarchyService, UnitHierarchyRepository],
})
export class UnitHierarchyModule {}
