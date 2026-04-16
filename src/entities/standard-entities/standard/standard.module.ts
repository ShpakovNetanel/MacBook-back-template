import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ReportModule } from "src/entities/report-entities/report/report.module";
import { UnitHierarchyModule } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { CategoryDesc } from "../models/category-desc.model";
import { CategoryGroup } from "../models/category-group.model";
import { MaterialStandardGroup } from "../models/material-standard-group.model";
import { MaterialStandardGroupType } from "../models/material-standard-group-type.model";
import { StandardAttribute } from "../models/standard-attribute.model";
import { StandardGroup } from "../models/standard-group.model";
import { StandardTag } from "../models/standard-tag.model";
import { StandardValue } from "../models/standard-value.model";
import { TagGroup } from "../models/tag-group.model";
import { UnitStandardTag } from "../models/unit-standard-tag.model";
import { StandardController } from "./standard.controller";
import { StandardRepository } from "./standard.repository";
import { StandardService } from "./standard.service";
import { UnitStatus } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";

@Module({
    imports: [
        SequelizeModule.forFeature([
            MaterialStandardGroupType,
            CategoryDesc,
            CategoryGroup,
            StandardGroup,
            MaterialStandardGroup,
            TagGroup,
            StandardTag,
            UnitStandardTag,
            StandardAttribute,
            StandardValue,
            UnitStatus,
            Material,
            Unit,
        ]),
        ReportModule,
        UnitHierarchyModule,
    ],
    controllers: [StandardController],
    providers: [StandardService, StandardRepository],
    exports: [StandardService],
})
export class StandardModule { }
