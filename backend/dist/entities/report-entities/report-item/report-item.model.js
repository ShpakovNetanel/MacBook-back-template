"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportItem = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const material_model_1 = require("../../material-entities/material/material.model");
const standard_group_model_1 = require("../../standard-entities/standard-group/standard-group.model");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const report_model_1 = require("../report/report.model");
let ReportItem = class ReportItem extends sequelize_typescript_1.Model {
};
exports.ReportItem = ReportItem;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => report_model_1.Report),
    (0, sequelize_typescript_1.Column)({ field: "report_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ReportItem.prototype, "reportId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => material_model_1.Material),
    (0, sequelize_typescript_1.Column)({ field: "material_id", type: sequelize_typescript_1.DataType.STRING(18) }),
    __metadata("design:type", String)
], ReportItem.prototype, "materialId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "reporting_level", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ReportItem.prototype, "reportingLevel", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: "reporting_unit", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], ReportItem.prototype, "reportingUnitId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "reported_quantity", type: sequelize_typescript_1.DataType.DECIMAL }),
    __metadata("design:type", Object)
], ReportItem.prototype, "reportedQuantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "confirmed_quantity", type: sequelize_typescript_1.DataType.DECIMAL }),
    __metadata("design:type", Object)
], ReportItem.prototype, "confirmedQuantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "balance_quantity", type: sequelize_typescript_1.DataType.DECIMAL }),
    __metadata("design:type", Object)
], ReportItem.prototype, "balanceQuantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", Object)
], ReportItem.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "changed_at", type: sequelize_typescript_1.DataType.TIME }),
    __metadata("design:type", Object)
], ReportItem.prototype, "changedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "changed_by", type: sequelize_typescript_1.DataType.STRING(20) }),
    __metadata("design:type", Object)
], ReportItem.prototype, "changedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "modified_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Object)
], ReportItem.prototype, "modifiedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => report_model_1.Report),
    __metadata("design:type", report_model_1.Report)
], ReportItem.prototype, "report", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => material_model_1.Material),
    __metadata("design:type", material_model_1.Material)
], ReportItem.prototype, "material", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => standard_group_model_1.StandardGroup, { foreignKey: "materialId", constraints: false }),
    __metadata("design:type", standard_group_model_1.StandardGroup)
], ReportItem.prototype, "standardGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId, { foreignKey: "reportingUnitId" }),
    __metadata("design:type", unit_id_model_1.UnitId)
], ReportItem.prototype, "reportingUnit", void 0);
exports.ReportItem = ReportItem = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "report_items", timestamps: false })
], ReportItem);
//# sourceMappingURL=report-item.model.js.map