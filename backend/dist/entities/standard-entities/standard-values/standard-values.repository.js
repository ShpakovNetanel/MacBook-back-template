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
exports.StandardValuesRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const standard_values_model_1 = require("./standard-values.model");
let StandardValuesRepository = class StandardValuesRepository {
    standardValuesModel;
    constructor(standardValuesModel) {
        this.standardValuesModel = standardValuesModel;
    }
    fetchByTagId(tagId) {
        return this.standardValuesModel.findAll({ where: { tagId } });
    }
    fetchByTagGroupId(tagGroupId) {
        return this.standardValuesModel.findAll({
            include: [{
                    association: 'tag',
                    where: { tagGroupId }
                }]
        });
    }
};
exports.StandardValuesRepository = StandardValuesRepository;
exports.StandardValuesRepository = StandardValuesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(standard_values_model_1.StandardValues)),
    __metadata("design:paramtypes", [Object])
], StandardValuesRepository);
//# sourceMappingURL=standard-values.repository.js.map