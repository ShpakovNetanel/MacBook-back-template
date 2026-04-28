"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardTagModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const standard_tag_model_1 = require("./standard-tag.model");
const standard_tag_controller_1 = require("./standard-tag.controller");
const standard_tag_service_1 = require("./standard-tag.service");
const standard_tag_repository_1 = require("./standard-tag.repository");
const standard_values_module_1 = require("../standard-values/standard-values.module");
let StandardTagModule = class StandardTagModule {
};
exports.StandardTagModule = StandardTagModule;
exports.StandardTagModule = StandardTagModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([standard_tag_model_1.StandardTag]), standard_values_module_1.StandardValuesModule],
        controllers: [standard_tag_controller_1.StandardTagController],
        providers: [standard_tag_service_1.StandardTagService, standard_tag_repository_1.StandardTagRepository],
        exports: [standard_tag_repository_1.StandardTagRepository]
    })
], StandardTagModule);
//# sourceMappingURL=standard-tag.module.js.map