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
exports.ReportRoutingRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const report_model_1 = require("./report.model");
let ReportRoutingRepository = class ReportRoutingRepository {
    reportModel;
    constructor(reportModel) {
        this.reportModel = reportModel;
    }
    rerouteUnitReportsToParentForDate(unitId, date, recipientUnitId, reporterUnitId, createdBy, transaction) {
        return this.reportModel.update({
            recipientUnitId,
            reporterUnitId,
            createdBy,
        }, {
            where: {
                unitId,
                createdOn: date,
            },
            transaction,
        });
    }
};
exports.ReportRoutingRepository = ReportRoutingRepository;
exports.ReportRoutingRepository = ReportRoutingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(report_model_1.Report)),
    __metadata("design:paramtypes", [Object])
], ReportRoutingRepository);
//# sourceMappingURL=report-routing.repository.js.map