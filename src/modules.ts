import { MaterialModule } from "./entities/material-entities/material/material.module";
import { UnitFavoriteMaterialModule } from "./entities/material-entities/unit-favorite-material/unit-favorite-material.module";
import { CommentModule } from "./entities/report-entities/comment/comment.module";
import { ExcelModule } from "./entities/report-entities/excel/excel.module";
import { ReportItemModule } from "./entities/report-entities/report-item/report-item.module";
import { ReportModule } from "./entities/report-entities/report/report.module";
import { StandardTagModule } from "./entities/standard-entities/standard-tag/standard-tag.module";
import { StandardValuesModule } from "./entities/standard-entities/standard-values/standard-values.module";
import { TagGroupModule } from "./entities/standard-entities/tag-group/tag-group.module";
import { UnitStandardTagModule } from "./entities/standard-entities/unit-standard-tag/unit-standard-tag.module";
import { UnitHierarchyModule } from "./entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { UnitStatusTypesModule } from "./entities/unit-entities/units-statuses/units-statuses.module";
import { UnitUserModule } from "./entities/unit-entities/users/user.module";

export default [
    MaterialModule,
    UnitFavoriteMaterialModule,
    UnitHierarchyModule,
    ReportModule,
    ExcelModule,
    UnitStatusTypesModule,
    CommentModule,
    ReportItemModule,
    TagGroupModule,
    StandardTagModule,
    UnitStandardTagModule,
    UnitUserModule,
    StandardValuesModule
];
