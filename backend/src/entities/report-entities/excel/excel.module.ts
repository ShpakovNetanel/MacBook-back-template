import { Module } from "@nestjs/common";
import { MaterialModule } from "../../material-entities/material/material.module";
import { UnitHierarchyModule } from "../../unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { ReportModule } from "../report/report.module";
import { ExcelController } from "./excel.controller";
import { ExcelService } from "./excel.service";

@Module({
    imports: [
        MaterialModule,
        ReportModule,
        UnitHierarchyModule,
    ],
    controllers: [ExcelController],
    providers: [ExcelService],
})
export class ExcelModule { }
