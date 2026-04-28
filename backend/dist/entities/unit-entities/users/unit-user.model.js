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
exports.UnitUser = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let UnitUser = class UnitUser extends sequelize_typescript_1.Model {
};
exports.UnitUser = UnitUser;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "user_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitUser.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitUser.prototype, "unitId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "start_date", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], UnitUser.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "end_date", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], UnitUser.prototype, "endDate", void 0);
exports.UnitUser = UnitUser = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "unit_users", timestamps: false })
], UnitUser);
//# sourceMappingURL=unit-user.model.js.map