import { MaterialModule } from "./entities/material-entities/material/material.module";
import { UnitFavoriteMaterialModule } from "./entities/material-entities/unit-favorite-material/unit-favorite-material.module";
import { CommentModule } from "./entities/report-entities/comment/comment.module";
import { ReportItemModule } from "./entities/report-entities/report-item/report-item.module";
import { ReportModule } from "./entities/report-entities/report/report.module";
import { StandardTagModule } from "./entities/standard-entities/standard-tag/standard-tag.module";
import { TagGroupModule } from "./entities/standard-entities/tag-group/tag-group.module";
import { UnitHierarchyModule } from "./entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { UnitStatusTypesModule } from "./entities/unit-entities/units-statuses/units-statuses.module";

export default [
    MaterialModule,
    UnitFavoriteMaterialModule,
    UnitHierarchyModule,
    ReportModule,
    UnitStatusTypesModule,
    CommentModule,
    ReportItemModule,
    TagGroupModule,
    StandardTagModule
];
