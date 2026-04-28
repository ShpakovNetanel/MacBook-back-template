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
exports.UnitFavoriteMaterialController = void 0;
const common_1 = require("@nestjs/common");
const dto_1 = require("./DTO/dto");
const unit_favorite_material_service_1 = require("./unit-favorite-material.service");
let UnitFavoriteMaterialController = class UnitFavoriteMaterialController {
    service;
    constructor(service) {
        this.service = service;
    }
    createUnitFavoriteMaterial(unitFavoriteMaterial) {
        return this.service.create(unitFavoriteMaterial);
    }
    deleteUnitFavoriteMaterial(unitFavoriteMaterial) {
        return this.service.destroy(unitFavoriteMaterial);
    }
};
exports.UnitFavoriteMaterialController = UnitFavoriteMaterialController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUnitFavoriteMaterial]),
    __metadata("design:returntype", void 0)
], UnitFavoriteMaterialController.prototype, "createUnitFavoriteMaterial", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DeleteUnitFavoriteMaterial]),
    __metadata("design:returntype", void 0)
], UnitFavoriteMaterialController.prototype, "deleteUnitFavoriteMaterial", null);
exports.UnitFavoriteMaterialController = UnitFavoriteMaterialController = __decorate([
    (0, common_1.Controller)('favoriteMaterial'),
    __metadata("design:paramtypes", [unit_favorite_material_service_1.UnitFavoriteMaterialService])
], UnitFavoriteMaterialController);
//# sourceMappingURL=unit-favorite-material.controller.js.map