"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardValuesModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const standard_values_model_1 = require("./standard-values.model");
const standard_values_repository_1 = require("./standard-values.repository");
let StandardValuesModule = class StandardValuesModule {
};
exports.StandardValuesModule = StandardValuesModule;
exports.StandardValuesModule = StandardValuesModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([standard_values_model_1.StandardValues])],
        providers: [standard_values_repository_1.StandardValuesRepository],
        exports: [standard_values_repository_1.StandardValuesRepository]
    })
], StandardValuesModule);
//# sourceMappingURL=standard-values.module.js.map