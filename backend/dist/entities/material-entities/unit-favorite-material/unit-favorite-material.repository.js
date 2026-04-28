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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitFavoriteMaterialRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const unit_favorite_material_model_1 = require("./unit-favorite-material.model");
let UnitFavoriteMaterialRepository = class UnitFavoriteMaterialRepository {
    unitFavoriteMaterialModel;
    constructor(unitFavoriteMaterialModel) {
        this.unitFavoriteMaterialModel = unitFavoriteMaterialModel;
    }
    async create(unitFavoriteMaterial) {
        try {
            return await this.unitFavoriteMaterialModel.create(unitFavoriteMaterial);
        }
        catch (error) {
            console.log(error);
        }
    }
    destroy(unitFavoriteMaterial) {
        return this.unitFavoriteMaterialModel.destroy({
            where: { ...unitFavoriteMaterial }
        });
    }
};
exports.UnitFavoriteMaterialRepository = UnitFavoriteMaterialRepository;
exports.UnitFavoriteMaterialRepository = UnitFavoriteMaterialRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(unit_favorite_material_model_1.UnitFavoriteMaterial)),
    __metadata("design:paramtypes", [Object])
], UnitFavoriteMaterialRepository);
//# sourceMappingURL=unit-favorite-material.repository.js.map