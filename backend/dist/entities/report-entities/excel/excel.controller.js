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
exports.ExcelController = void 0;
const common_1 = require("@nestjs/common");
const excel_service_1 = require("./excel.service");
let ExcelController = class ExcelController {
    service;
    constructor(service) {
        this.service = service;
    }
    async downloadTemplate(response) {
        const template = await this.service.downloadTemplate();
        response.setHeader("Content-Type", template.mimeType);
        response.setHeader("Content-Disposition", `attachment; filename="${template.fileName}"`);
        response.send(template.buffer);
    }
    importExcelRows(excelImportBody, request) {
        return this.service.importExcelRows(request["date"], Number(request.headers["unit"]), excelImportBody);
    }
    exportAllocationDuh(downloadAllocationsDTO, request) {
        return this.service.exportAllocationDuh(request["date"], Number(request.headers["unit"]), downloadAllocationsDTO?.materialId);
    }
};
exports.ExcelController = ExcelController;
__decorate([
    (0, common_1.Get)("template"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExcelController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)("upload"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ExcelController.prototype, "importExcelRows", null);
__decorate([
    (0, common_1.Post)("allocationDuh"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ExcelController.prototype, "exportAllocationDuh", null);
exports.ExcelController = ExcelController = __decorate([
    (0, common_1.Controller)("/excel"),
    __metadata("design:paramtypes", [excel_service_1.ExcelService])
], ExcelController);
//# sourceMappingURL=excel.controller.js.map