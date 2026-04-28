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
exports.UnitId = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_model_1 = require("../unit/unit.model");
const units_statuses_model_1 = require("../units-statuses/units-statuses.model");
let UnitId = class UnitId extends sequelize_typescript_1.Model {
    get activeDetail() {
        return this.details?.[0];
    }
};
exports.UnitId = UnitId;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], UnitId.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => unit_model_1.Unit, { foreignKey: "unitId" }),
    __metadata("design:type", Array)
], UnitId.prototype, "details", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => units_statuses_model_1.UnitStatus, { foreignKey: "unitId" }),
    __metadata("design:type", Array)
], UnitId.prototype, "unitStatus", void 0);
exports.UnitId = UnitId = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "units_ids", timestamps: false })
], UnitId);
//# sourceMappingURL=unit-id.model.js.map