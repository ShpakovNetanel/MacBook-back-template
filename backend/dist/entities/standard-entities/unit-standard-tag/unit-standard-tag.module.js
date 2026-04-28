"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitStandardTagModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const standard_tag_module_1 = require("../standard-tag/standard-tag.module");
const unit_standard_tag_controller_1 = require("./unit-standard-tag.controller");
const unit_standard_tag_model_1 = require("./unit-standard-tag.model");
const unit_standard_tag_repository_1 = require("./unit-standard-tag.repository");
const unit_standard_tag_service_1 = require("./unit-standard-tag.service");
let UnitStandardTagModule = class UnitStandardTagModule {
};
exports.UnitStandardTagModule = UnitStandardTagModule;
exports.UnitStandardTagModule = UnitStandardTagModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([unit_standard_tag_model_1.UnitStandardTags]), standard_tag_module_1.StandardTagModule],
        controllers: [unit_standard_tag_controller_1.UnitStandardTagController],
        providers: [unit_standard_tag_service_1.UnitStandardTagService, unit_standard_tag_repository_1.UnitStanadrdTagRepository],
    })
], UnitStandardTagModule);
//# sourceMappingURL=unit-standard-tag.module.js.map