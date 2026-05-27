import { Body, Controller, Delete, Get, Headers, Post, Put, Req } from "@nestjs/common";
import { UnitHierarchyService } from "./unit-hierarchy.service";
import type { Request } from "express";
import { RemoveUnitRelationDto } from "./DTO/remove-unit-relation.dto";
import { AddUnitRelationDto } from "./DTO/add-unit-relation.dto";
import { TransferUnitRelationDto } from "./DTO/update-unit-relation.dto";
import { RequireScreenUnitRequesting } from "src/common/decorators/require-screen-unit-requesting.decorator";

@Controller("/units")
export class UnitHierarchyController {
  constructor(private readonly service: UnitHierarchyService) { }

  @Get("")
  async getAllUnits(@Req() request: Request) {
    return this.service.getAllUnitsWithParents(request?.["date"]);
  }

  @Get("hierarchy")
  async getHierarchy(@Req() request: Request) {
    const username = request?.['username'] as string ?? '';

    return this.service.getHierarchyForUser(username, request?.["date"]);
  }

  @RequireScreenUnitRequesting()
  @Post("hierarchy")
  addUnitRelation(
    @Body() addUnitRelationDto: AddUnitRelationDto,
    @Req() request: Request
  ) {
    return this.service.addUnitRelation(
      addUnitRelationDto,
      request?.["date"],
      request?.["username"]
    );
  }

  @RequireScreenUnitRequesting()
  @Delete("hierarchy")
  removeUnitRelation(
    @Body() removeUnitRelationDto: RemoveUnitRelationDto,
    @Req() request: Request
  ) {
    return this.service.removeUnitRelation(removeUnitRelationDto, request?.["date"]);
  }

  @RequireScreenUnitRequesting()
  @Put("hierarchy")
  transferUnitRelation(
    @Body() transferUnitRelationDto: TransferUnitRelationDto,
    @Req() request: Request
  ) {
    return this.service.transferUnitRelation(
      transferUnitRelationDto,
      request?.["date"],
      request?.["username"]
    );
  }
}
