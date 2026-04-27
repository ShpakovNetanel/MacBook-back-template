import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ReportModule } from "src/entities/report-entities/report/report.module";
import { UnitHierarchyModule } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { StandardAttribute } from "../standard-attribute/standard-attribute.model";
import { StandardController } from "./standard.controller";
import { StandardRepository } from "./standard.repository";
import { StandardService } from "./standard.service";
import { UnitStatus } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { CategoryDesc } from "../category-desc/category-desc.model";
import { CategoryGroup } from "../category-group/category-group.model";
import { StandardGroup } from "../standard-group/standard-group.model";
import { MaterialStandardGroup } from "../material-standard-group/material-standard-group.model";
import { TagGroup } from "../tag-group/tag-group.model";
import { StandardTag } from "../standard-tag/standard-tag.model";
import { UnitStandardTags } from "../unit-standard-tag/unit-standard-tag.model";
import { StandardValues } from "../standard-values/standard-values.model";

@Module({
    imports: [
        SequelizeModule.forFeature([
            CategoryDesc,
            CategoryGroup,
            StandardGroup,
            MaterialStandardGroup,
            TagGroup,
            StandardTag,
            UnitStandardTags,
            StandardAttribute,
            StandardValues,
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
