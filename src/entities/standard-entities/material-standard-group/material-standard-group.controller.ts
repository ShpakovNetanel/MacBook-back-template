import { Controller, Get, Query } from '@nestjs/common';
import { MaterialStandardGroupService } from './material-standard-group.service';

@Controller('materialStandardGroup')
export class MaterialStandardGroupController {
  constructor(private readonly service: MaterialStandardGroupService) {}

  @Get('groupMaterials')
  fetchGroupMaterials(@Query('materialId') materialId: string) {
    return this.service.fetchGroupMaterials(materialId);
  }
}
