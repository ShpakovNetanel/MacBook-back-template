"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitStatusModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const units_statuses_model_1 = require("./units-statuses.model");
const units_statuses_controller_1 = require("./units-statuses.controller");
const units_statuses_service_1 = require("./units-statuses.service");
const units_statuses_repository_1 = require("./units-statuses.repository");
const unit_relation_model_1 = require("../unit-relations/unit-relation.model");
let UnitStatusModule = class UnitStatusModule {
};
exports.UnitStatusModule = UnitStatusModule;
exports.UnitStatusModule = UnitStatusModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([units_statuses_model_1.UnitStatus, unit_relation_model_1.UnitRelation])],
        controllers: [units_statuses_controller_1.UnitStatusController],
        providers: [units_statuses_service_1.UnitStatusService, units_statuses_repository_1.UnitStatusRepository],
        exports: [units_statuses_service_1.UnitStatusService, units_statuses_repository_1.UnitStatusRepository]
    })
], UnitStatusModule);
//# sourceMappingURL=units-statuses.module.js.map