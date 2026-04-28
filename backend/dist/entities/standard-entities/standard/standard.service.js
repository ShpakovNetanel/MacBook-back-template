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
exports.StandardService = void 0;
const common_1 = require("@nestjs/common");
const report_repository_1 = require("../../report-entities/report/report.repository");
const unit_hierarchy_service_1 = require("../../unit-entities/features/unit-hierarchy/unit-hierarchy.service");
const standard_repository_1 = require("./standard.repository");
const standard_utils_1 = require("./utilities/standard.utils");
let StandardService = class StandardService {
    standardRepository;
    reportRepository;
    unitHierarchyService;
    constructor(standardRepository, reportRepository, unitHierarchyService) {
        this.standardRepository = standardRepository;
        this.reportRepository = reportRepository;
        this.unitHierarchyService = unitHierarchyService;
    }
    async getRelevantToolMaterialIds(screenUnitId, date) {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const { parentUnitIdByChildUnitId } = (0, standard_utils_1.buildHierarchyLookups)(activeRelations);
        const ancestorUnitIds = (0, standard_utils_1.getAncestorUnitIds)(screenUnitId, parentUnitIdByChildUnitId);
        const unitsAllowedToManageStandards = new Set([screenUnitId, ...ancestorUnitIds]);
        const unitIdsForTagMatching = [screenUnitId, ...ancestorUnitIds];
        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);
        const standardsManagedByScreenPath = allStandards.filter(standard => unitsAllowedToManageStandards.has(standard.managingUnit));
        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(unitIdsForTagMatching);
        const standardsRelevantToScreenPath = (0, standard_utils_1.filterStandardsByAncestorTags)(standardsManagedByScreenPath, unitIdsForTagMatching, unitTagsByUnit);
        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const toolMaterialIds = new Set();
        for (const standard of standardsRelevantToScreenPath) {
            if (standard.toolGroupId) {
                toolMaterialIds.add(standard.toolGroupId);
                for (const materialId of (groupToMaterialMap.get(standard.toolGroupId) ?? [])) {
                    toolMaterialIds.add(materialId);
                }
            }
        }
        return Array.from(toolMaterialIds);
    }
    async getStandards(screenUnitId, date) {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const { parentUnitIdByChildUnitId, childUnitIdsByParentUnitId } = (0, standard_utils_1.buildHierarchyLookups)(activeRelations);
        const ancestorUnitIds = (0, standard_utils_1.getAncestorUnitIds)(screenUnitId, parentUnitIdByChildUnitId);
        const unitsAllowedToManageStandards = new Set([screenUnitId, ...ancestorUnitIds]);
        const unitIdsForTagMatching = [screenUnitId, ...ancestorUnitIds];
        const directChildUnitIds = childUnitIdsByParentUnitId.get(screenUnitId) ?? [];
        if (directChildUnitIds.length === 0)
            return { materialCategories: [] };
        const childStatusByUnitId = await this.standardRepository.getUnitStatusesForDate(directChildUnitIds, date);
        const eligibleDirectChildUnitIds = (0, standard_utils_1.getEligibleStandardChildUnitIds)(directChildUnitIds, childStatusByUnitId);
        if (eligibleDirectChildUnitIds.length === 0)
            return { materialCategories: [] };
        const descendantUnitIds = eligibleDirectChildUnitIds.flatMap(unitId => [
            unitId,
            ...(0, standard_utils_1.getDescendantUnitIds)(unitId, childUnitIdsByParentUnitId),
        ]);
        const unitIdsForReportData = Array.from(new Set([screenUnitId, ...descendantUnitIds]));
        const unitIdsForDetails = Array.from(new Set([...unitIdsForReportData, ...unitIdsForTagMatching]));
        const unitDetails = await this.standardRepository.getUnitDetails(date, unitIdsForDetails);
        const unitInfoByUnitId = (0, standard_utils_1.buildUnitInfoByUnitId)(unitDetails);
        const unitIdsForStandardTags = Array.from(new Set([...unitIdsForTagMatching, ...descendantUnitIds]));
        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(unitIdsForStandardTags);
        const { groupToCategoryMap } = await this.standardRepository.getAllCategories();
        const reports = await this.reportRepository.fetchReportsDataForUnits(date, unitIdsForReportData);
        const liveMaterialDataByUnitId = (0, standard_utils_1.buildLiveMaterialDataByUnitId)(reports);
        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);
        const standardsManagedByScreenPath = allStandards.filter(standard => unitsAllowedToManageStandards.has(standard.managingUnit));
        const standardsRelevantToScreenPath = (0, standard_utils_1.filterStandardsByAncestorTags)(standardsManagedByScreenPath, unitIdsForTagMatching, unitTagsByUnit);
        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const allMaterials = await this.standardRepository.getAllMaterials();
        const allGroupNames = await this.standardRepository.getAllGroupNames();
        const calculatedStandards = [];
        for (const childUnitId of eligibleDirectChildUnitIds) {
            const childTagsByLevel = unitTagsByUnit.get(childUnitId) ?? new Map();
            const childInfo = unitInfoByUnitId.get(childUnitId);
            const childCalculatedStandards = (0, standard_utils_1.calculateStandardsForUnit)(childUnitId, childInfo?.description ?? String(childUnitId), childTagsByLevel, standardsRelevantToScreenPath, liveMaterialDataByUnitId, childUnitIdsByParentUnitId, unitInfoByUnitId, unitTagsByUnit, groupToMaterialMap);
            calculatedStandards.push(...childCalculatedStandards);
        }
        return (0, standard_utils_1.buildStandardResponse)(calculatedStandards, groupToCategoryMap, unitInfoByUnitId, allMaterials, allGroupNames, groupToMaterialMap, liveMaterialDataByUnitId);
    }
};
exports.StandardService = StandardService;
exports.StandardService = StandardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [standard_repository_1.StandardRepository,
        report_repository_1.ReportRepository,
        unit_hierarchy_service_1.UnitHierarchyService])
], StandardService);
//# sourceMappingURL=standard.service.js.map