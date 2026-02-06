import { MaterialModule } from "./entities/material-entities/material/material.module";
import { UnitFavoriteMaterialModule } from "./entities/material-entities/unit-favorite-material/unit-favorite-material.module";
import { ReportModule } from "./entities/report-entities/report/report.module";
import { UnitHierarchyModule } from "./entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { UnitStatusTypesModule } from "./entities/unit-entities/units-statuses/units-statuses.module";

export default [
    MaterialModule,
    UnitFavoriteMaterialModule,
    UnitHierarchyModule,
    ReportModule,
    UnitStatusTypesModule
];
