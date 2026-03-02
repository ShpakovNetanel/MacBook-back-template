import { Body, Controller, Delete, Get, Post, Put, Req } from "@nestjs/common";
import { UnitHierarchyService } from "./unit-hierarchy.service";
import type { Request } from "express";
import { RemoveUnitRelationDto } from "./DTO/remove-unit-relation.dto";
import { AddUnitRelationDto } from "./DTO/add-unit-relation.dto";
import { TransferUnitRelationDto } from "./DTO/update-unit-relation.dto";

@Controller("/units")
export class UnitHierarchyController {
  constructor(private readonly service: UnitHierarchyService) { }

  @Get("")
  async getAllUnits(@Req() request: Request) {
    return this.service.getAllUnitsWithParents(request?.["date"]);
  }

  @Get("hierarchy")
  async getHierarchy(@Req() request: Request) {
    return this.service.getHierarchyForUser(Number(request?.['unit'] ?? 1), request?.["date"]);
  }

  @Post("hierarchy")
  addUnitRelation(
    @Body() addUnitRelationDto: AddUnitRelationDto,
    @Req() request: Request
  ) {
    const headerUnit = Number(request.headers["unit"]);
    const reporterUnitId = Number.isNaN(headerUnit) ? null : headerUnit;

    return this.service.addUnitRelation(
      addUnitRelationDto,
      request?.["date"],
      reporterUnitId,
      request?.["username"]
    );
  }

  @Delete("hierarchy")
  removeUnitRelation(
    @Body() removeUnitRelationDto: RemoveUnitRelationDto,
    @Req() request: Request
  ) {
    const headerUnit = Number(request.headers["unit"]);
    const screenUnitId = Number.isNaN(headerUnit) ? null : headerUnit;
    return this.service.removeUnitRelation(removeUnitRelationDto, request?.["date"], screenUnitId);
  }

  @Put("hierarchy")
  transferUnitRelation(
    @Body() transferUnitRelationDto: TransferUnitRelationDto,
    @Req() request: Request
  ) {
    return this.service.transferUnitRelation(
      transferUnitRelationDto,
      request?.["date"],
      Number(request.headers["unit"]),
      request?.["username"]
    );
  }
}
