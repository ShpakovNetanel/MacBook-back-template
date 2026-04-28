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
exports.Unit = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_id_model_1 = require("../unit-id/unit-id.model");
let Unit = class Unit extends sequelize_typescript_1.Model {
};
exports.Unit = Unit;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: "unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Unit.prototype, "unitId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "start_date", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], Unit.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "end_date", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], Unit.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "object_type", type: sequelize_typescript_1.DataType.STRING(2) }),
    __metadata("design:type", String)
], Unit.prototype, "objectType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    __metadata("design:type", Object)
], Unit.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "level_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Unit.prototype, "unitLevelId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "unit_type_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Object)
], Unit.prototype, "unitTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "tsav_irgun_code", type: sequelize_typescript_1.DataType.STRING(10) }),
    __metadata("design:type", Object)
], Unit.prototype, "tsavIrgunCodeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId),
    __metadata("design:type", unit_id_model_1.UnitId)
], Unit.prototype, "unit", void 0);
exports.Unit = Unit = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "units", timestamps: false })
], Unit);
//# sourceMappingURL=unit.model.js.map