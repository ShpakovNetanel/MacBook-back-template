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
exports.UnitFavoriteMaterialService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../constants");
const unit_favorite_material_repository_1 = require("./unit-favorite-material.repository");
let UnitFavoriteMaterialService = class UnitFavoriteMaterialService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(unitFavoriteMaterial) {
        try {
            return await this.repository.create(unitFavoriteMaterial);
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: 'שמירת חומר מועדף נכשלה, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async destroy(unitFavoriteMaterial) {
        try {
            const deletedCount = await this.repository.destroy(unitFavoriteMaterial);
            return {
                data: { deletedCount },
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: 'מחיקת חומר מועדף נכשלה, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
};
exports.UnitFavoriteMaterialService = UnitFavoriteMaterialService;
exports.UnitFavoriteMaterialService = UnitFavoriteMaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [unit_favorite_material_repository_1.UnitFavoriteMaterialRepository])
], UnitFavoriteMaterialService);
//# sourceMappingURL=unit-favorite-material.service.js.map