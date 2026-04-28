"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelModule = void 0;
const common_1 = require("@nestjs/common");
const material_module_1 = require("../../material-entities/material/material.module");
const unit_hierarchy_module_1 = require("../../unit-entities/features/unit-hierarchy/unit-hierarchy.module");
const report_module_1 = require("../report/report.module");
const excel_controller_1 = require("./excel.controller");
const excel_service_1 = require("./excel.service");
let ExcelModule = class ExcelModule {
};
exports.ExcelModule = ExcelModule;
exports.ExcelModule = ExcelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            material_module_1.MaterialModule,
            report_module_1.ReportModule,
            unit_hierarchy_module_1.UnitHierarchyModule,
        ],
        controllers: [excel_controller_1.ExcelController],
        providers: [excel_service_1.ExcelService],
    })
], ExcelModule);
//# sourceMappingURL=excel.module.js.map