"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitHierarchyModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const report_routing_repository_1 = require("../../../report-entities/report/report-routing.repository");
const report_model_1 = require("../../../report-entities/report/report.model");
const unit_id_model_1 = require("../../unit-id/unit-id.model");
const unit_relation_model_1 = require("../../unit-relations/unit-relation.model");
const unit_status_type_model_1 = require("../../unit-status-type/unit-status-type.model");
const unit_model_1 = require("../../unit/unit.model");
const units_statuses_model_1 = require("../../units-statuses/units-statuses.model");
const units_statuses_repository_1 = require("../../units-statuses/units-statuses.repository");
const unit_hierarchy_controller_1 = require("./unit-hierarchy.controller");
const unit_hierarchy_repository_1 = require("./unit-hierarchy.repository");
const unit_hierarchy_service_1 = require("./unit-hierarchy.service");
const user_module_1 = require("../../users/user.module");
let UnitHierarchyModule = class UnitHierarchyModule {
};
exports.UnitHierarchyModule = UnitHierarchyModule;
exports.UnitHierarchyModule = UnitHierarchyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                unit_id_model_1.UnitId,
                unit_model_1.Unit,
                unit_relation_model_1.UnitRelation,
                unit_status_type_model_1.UnitStatusType,
                units_statuses_model_1.UnitStatus,
                report_model_1.Report,
            ]),
            user_module_1.UnitUserModule
        ],
        controllers: [unit_hierarchy_controller_1.UnitHierarchyController],
        providers: [
            unit_hierarchy_service_1.UnitHierarchyService,
            unit_hierarchy_repository_1.UnitHierarchyRepository,
            units_statuses_repository_1.UnitStatusRepository,
            report_routing_repository_1.ReportRoutingRepository
        ],
        exports: [unit_hierarchy_service_1.UnitHierarchyService, unit_hierarchy_repository_1.UnitHierarchyRepository]
    })
], UnitHierarchyModule);
//# sourceMappingURL=unit-hierarchy.module.js.map