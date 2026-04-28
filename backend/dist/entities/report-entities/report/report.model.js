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
exports.Report = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const report_item_model_1 = require("../report-item/report-item.model");
let Report = class Report extends sequelize_typescript_1.Model {
};
exports.Report = Report;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, autoIncrement: true }),
    __metadata("design:type", Number)
], Report.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "report_type_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Report.prototype, "reportTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Report.prototype, "unitId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "recipient_unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Object)
], Report.prototype, "recipientUnitId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "reporter_unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Object)
], Report.prototype, "reporterUnitId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "created_on", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Object)
], Report.prototype, "createdOn", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "created_at", type: sequelize_typescript_1.DataType.TIME }),
    __metadata("design:type", Object)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "created_by", type: sequelize_typescript_1.DataType.STRING(20) }),
    __metadata("design:type", Object)
], Report.prototype, "createdBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId, { foreignKey: "unitId", as: "unit" }),
    __metadata("design:type", unit_id_model_1.UnitId)
], Report.prototype, "unit", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId, { foreignKey: "recipientUnitId", as: "recipientUnit" }),
    __metadata("design:type", unit_id_model_1.UnitId)
], Report.prototype, "recipientUnit", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId, { foreignKey: "reporterUnitId", as: "reporterUnit" }),
    __metadata("design:type", unit_id_model_1.UnitId)
], Report.prototype, "reporterUnit", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => report_item_model_1.ReportItem),
    __metadata("design:type", Array)
], Report.prototype, "items", void 0);
exports.Report = Report = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "reports", timestamps: false })
], Report);
//# sourceMappingURL=report.model.js.map