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
exports.StandardAttribute = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const standard_group_model_1 = require("../standard-group/standard-group.model");
const standard_values_model_1 = require("../standard-values/standard-values.model");
let StandardAttribute = class StandardAttribute extends sequelize_typescript_1.Model {
};
exports.StandardAttribute = StandardAttribute;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], StandardAttribute.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: "managing_unit", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], StandardAttribute.prototype, "managingUnit", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => standard_group_model_1.StandardGroup),
    (0, sequelize_typescript_1.Column)({ field: "item_group_id", type: sequelize_typescript_1.DataType.STRING(9) }),
    __metadata("design:type", String)
], StandardAttribute.prototype, "itemGroupId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => standard_group_model_1.StandardGroup),
    (0, sequelize_typescript_1.Column)({ field: "tool_group_id", type: sequelize_typescript_1.DataType.STRING(9), allowNull: true }),
    __metadata("design:type", Object)
], StandardAttribute.prototype, "toolGroupId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId),
    __metadata("design:type", unit_id_model_1.UnitId)
], StandardAttribute.prototype, "managingUnitDetails", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => standard_group_model_1.StandardGroup, { foreignKey: "itemGroupId" }),
    __metadata("design:type", standard_group_model_1.StandardGroup)
], StandardAttribute.prototype, "itemGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => standard_group_model_1.StandardGroup, { foreignKey: "toolGroupId" }),
    __metadata("design:type", standard_group_model_1.StandardGroup)
], StandardAttribute.prototype, "toolGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => standard_values_model_1.StandardValues),
    __metadata("design:type", Array)
], StandardAttribute.prototype, "values", void 0);
exports.StandardAttribute = StandardAttribute = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "standard_attributes", timestamps: false })
], StandardAttribute);
//# sourceMappingURL=standard-attribute.model.js.map