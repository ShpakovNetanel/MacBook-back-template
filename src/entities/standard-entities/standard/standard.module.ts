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
import { CategoryDesc } from "../../../../backend/src/entities/standard-entities/category-desc/category-desc.model";
import { CategoryGroup } from "../../../../backend/src/entities/standard-entities/category-group/category-group.model";
import { StandardGroup } from "../../../../backend/src/entities/standard-entities/standard-group/standard-group.model";
import { MaterialStandardGroup } from "../../../../backend/src/entities/standard-entities/material-standard-group/material-standard-group.model";
import { TagGroup } from "../../../../backend/src/entities/standard-entities/tag-group/tag-group.model";
import { StandardTag } from "../../../../backend/src/entities/standard-entities/standard-tag/standard-tag.model";
import { UnitStandardTags } from "../../../../backend/src/entities/standard-entities/unit-standard-tag/unit-standard-tag.model";
import { StandardValues } from "../../../../backend/src/entities/standard-entities/standard-values/standard-values.model";

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
