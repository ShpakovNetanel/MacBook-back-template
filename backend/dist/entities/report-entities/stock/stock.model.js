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
exports.Stock = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const material_model_1 = require("../../material-entities/material/material.model");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
let Stock = class Stock extends sequelize_typescript_1.Model {
};
exports.Stock = Stock;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => material_model_1.Material),
    (0, sequelize_typescript_1.Column)({ field: "material_id", type: sequelize_typescript_1.DataType.STRING(18) }),
    __metadata("design:type", String)
], Stock.prototype, "materialId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: "unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Stock.prototype, "unitId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "stock_type", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Stock.prototype, "stockType", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(2)),
    __metadata("design:type", String)
], Stock.prototype, "grade", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Stock.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", String)
], Stock.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => material_model_1.Material),
    __metadata("design:type", material_model_1.Material)
], Stock.prototype, "material", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId),
    __metadata("design:type", unit_id_model_1.UnitId)
], Stock.prototype, "unit", void 0);
exports.Stock = Stock = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "stocks", timestamps: false })
], Stock);
//# sourceMappingURL=stock.model.js.map