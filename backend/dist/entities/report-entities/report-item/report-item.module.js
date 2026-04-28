"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportItemModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const unit_module_1 = require("../../unit-entities/unit/unit.module");
const units_statuses_module_1 = require("../../unit-entities/units-statuses/units-statuses.module");
const report_model_1 = require("../report/report.model");
const report_item_controller_1 = require("./report-item.controller");
const report_item_model_1 = require("./report-item.model");
const report_item_repository_1 = require("./report-item.repository");
const report_item_service_1 = require("./report-item.service");
let ReportItemModule = class ReportItemModule {
};
exports.ReportItemModule = ReportItemModule;
exports.ReportItemModule = ReportItemModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([report_item_model_1.ReportItem, report_model_1.Report]), unit_module_1.UnitModule, units_statuses_module_1.UnitStatusModule],
        providers: [report_item_repository_1.ReportItemRepository, report_item_service_1.ReportItemService],
        controllers: [report_item_controller_1.ReportItemController]
    })
], ReportItemModule);
//# sourceMappingURL=report-item.module.js.map