import { Injectable } from "@nestjs/common";
import { ReportRepository } from "src/entities/report-entities/report/report.repository";
import { UnitHierarchyService } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import { CalculatedUnitStandard, StandardResponse } from "./standard.types";
import { StandardRepository } from "./standard.repository";
import {
    buildHierarchyLookups,
    buildLiveMaterialDataByUnitId,
    buildStandardResponse,
    buildUnitInfoByUnitId,
    calculateStandardsForUnit,
    filterStandardsByAncestorTags,
    getAncestorUnitIds,
    getDescendantUnitIds,
    getEligibleStandardChildUnitIds,
} from "./utilities/standard.utils";

@Injectable()
export class StandardService {
    constructor(
        private readonly standardRepository: StandardRepository,
        private readonly reportRepository: ReportRepository,
        private readonly unitHierarchyService: UnitHierarchyService,
    ) { }

    async getRelevantToolMaterialIds(screenUnitId: number, date: string): Promise<string[]> {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const { parentUnitIdByChildUnitId } = buildHierarchyLookups(activeRelations);

        const ancestorUnitIds = getAncestorUnitIds(screenUnitId, parentUnitIdByChildUnitId);
        const unitsAllowedToManageStandards = new Set([screenUnitId, ...ancestorUnitIds]);
        const unitIdsForTagMatching = [screenUnitId, ...ancestorUnitIds];

        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);
        const standardsManagedByScreenPath = allStandards.filter(standard => unitsAllowedToManageStandards.has(standard.managingUnit));

        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(unitIdsForTagMatching);
        const standardsRelevantToScreenPath = filterStandardsByAncestorTags(standardsManagedByScreenPath, unitIdsForTagMatching, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const toolMaterialIds = new Set<string>();
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

    async getStandards(screenUnitId: number, date: string): Promise<StandardResponse> {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const { parentUnitIdByChildUnitId, childUnitIdsByParentUnitId } = buildHierarchyLookups(activeRelations);

        const ancestorUnitIds = getAncestorUnitIds(screenUnitId, parentUnitIdByChildUnitId);
        const unitsAllowedToManageStandards = new Set([screenUnitId, ...ancestorUnitIds]);
        const unitIdsForTagMatching = [screenUnitId, ...ancestorUnitIds];

        const directChildUnitIds = childUnitIdsByParentUnitId.get(screenUnitId) ?? [];
        if (directChildUnitIds.length === 0) return { materialCategories: [] };

        const childStatusByUnitId = await this.standardRepository.getUnitStatusesForDate(directChildUnitIds, date);
        const eligibleDirectChildUnitIds = getEligibleStandardChildUnitIds(directChildUnitIds, childStatusByUnitId);
        if (eligibleDirectChildUnitIds.length === 0) return { materialCategories: [] };

        const descendantUnitIds = eligibleDirectChildUnitIds.flatMap(unitId => [
            unitId,
            ...getDescendantUnitIds(unitId, childUnitIdsByParentUnitId),
        ]);
        const unitIdsForReportData = Array.from(new Set([screenUnitId, ...descendantUnitIds]));
        const unitIdsForDetails = Array.from(new Set([...unitIdsForReportData, ...unitIdsForTagMatching]));

        const unitDetails = await this.standardRepository.getUnitDetails(date, unitIdsForDetails);
        const unitInfoByUnitId = buildUnitInfoByUnitId(unitDetails);

        const unitIdsForStandardTags = Array.from(new Set([...unitIdsForTagMatching, ...descendantUnitIds]));
        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(unitIdsForStandardTags);

        const { groupToCategoryMap } = await this.standardRepository.getAllCategories();

        const reports = await this.reportRepository.fetchReportsDataForUnits(date, unitIdsForReportData);
        const liveMaterialDataByUnitId = buildLiveMaterialDataByUnitId(reports);

        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);
        const standardsManagedByScreenPath = allStandards.filter(standard => unitsAllowedToManageStandards.has(standard.managingUnit));
        const standardsRelevantToScreenPath = filterStandardsByAncestorTags(standardsManagedByScreenPath, unitIdsForTagMatching, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const allMaterials = await this.standardRepository.getAllMaterials();
        const allGroupNames = await this.standardRepository.getAllGroupNames();
        const calculatedStandards: CalculatedUnitStandard[] = [];
        for (const childUnitId of eligibleDirectChildUnitIds) {
            const childTagsByLevel = unitTagsByUnit.get(childUnitId) ?? new Map();
            const childInfo = unitInfoByUnitId.get(childUnitId);
            const childCalculatedStandards = calculateStandardsForUnit(
                childUnitId,
                childInfo?.description ?? String(childUnitId),
                childTagsByLevel,
                standardsRelevantToScreenPath,
                liveMaterialDataByUnitId,
                childUnitIdsByParentUnitId,
                unitInfoByUnitId,
                unitTagsByUnit,
                groupToMaterialMap,
            );
            calculatedStandards.push(...childCalculatedStandards);
        }

        return buildStandardResponse(
            calculatedStandards,
            groupToCategoryMap,
            unitInfoByUnitId,
            allMaterials,
            allGroupNames,
            groupToMaterialMap,
            liveMaterialDataByUnitId,
        );
    }
}
