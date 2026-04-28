"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitUserModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const unit_user_model_1 = require("./unit-user.model");
const unit_user_repository_1 = require("./unit-user.repository");
let UnitUserModule = class UnitUserModule {
};
exports.UnitUserModule = UnitUserModule;
exports.UnitUserModule = UnitUserModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([unit_user_model_1.UnitUser])],
        providers: [unit_user_repository_1.UnitUserRepository],
        exports: [unit_user_repository_1.UnitUserRepository]
    })
], UnitUserModule);
//# sourceMappingURL=unit-user.module.js.map