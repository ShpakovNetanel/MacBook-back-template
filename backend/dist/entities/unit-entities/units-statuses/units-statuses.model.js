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
exports.UnitStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_status_type_model_1 = require("../unit-status-type/unit-status-type.model");
const unit_id_model_1 = require("../unit-id/unit-id.model");
let UnitStatus = class UnitStatus extends sequelize_typescript_1.Model {
};
exports.UnitStatus = UnitStatus;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: "unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitStatus.prototype, "unitId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "date", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], UnitStatus.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "unit_status_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitStatus.prototype, "unitStatusId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_status_type_model_1.UnitStatusType, { foreignKey: "unitStatusId", as: "unitStatus" }),
    __metadata("design:type", unit_status_type_model_1.UnitStatusType)
], UnitStatus.prototype, "unitStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId, { foreignKey: 'unitId' }),
    __metadata("design:type", unit_id_model_1.UnitId)
], UnitStatus.prototype, "unit", void 0);
exports.UnitStatus = UnitStatus = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "units_statuses", timestamps: false })
], UnitStatus);
//# sourceMappingURL=units-statuses.model.js.map