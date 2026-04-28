"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitFavoriteMaterialModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const unit_favorite_material_model_1 = require("./unit-favorite-material.model");
const unit_favorite_material_controller_1 = require("./unit-favorite-material.controller");
const unit_favorite_material_service_1 = require("./unit-favorite-material.service");
const unit_favorite_material_repository_1 = require("./unit-favorite-material.repository");
let UnitFavoriteMaterialModule = class UnitFavoriteMaterialModule {
};
exports.UnitFavoriteMaterialModule = UnitFavoriteMaterialModule;
exports.UnitFavoriteMaterialModule = UnitFavoriteMaterialModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([unit_favorite_material_model_1.UnitFavoriteMaterial])],
        providers: [unit_favorite_material_service_1.UnitFavoriteMaterialService, unit_favorite_material_repository_1.UnitFavoriteMaterialRepository],
        controllers: [unit_favorite_material_controller_1.UnitFavoriteMaterialController]
    })
], UnitFavoriteMaterialModule);
//# sourceMappingURL=unit-favorite-material.module.js.map