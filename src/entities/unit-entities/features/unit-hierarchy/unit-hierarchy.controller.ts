import { Controller, Get, Req } from "@nestjs/common";
import { UnitHierarchyService } from "./unit-hierarchy.service";
import type { Request } from "express";

@Controller("/units")
export class UnitHierarchyController {
  constructor(private readonly service: UnitHierarchyService) { }

  @Get("hierarchy")
  async getHierarchy(@Req() request: Request) {
    return this.service.getHierarchyForUser(Number(request?.['unit'] ?? 1), request?.["date"]);
  }
}
