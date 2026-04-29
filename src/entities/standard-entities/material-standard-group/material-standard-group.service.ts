    import { Injectable } from '@nestjs/common';
import { MaterialStandardGroupRepository } from './material-standard-group.repository';

@Injectable()
export class MaterialStandardGroupService {
  constructor(private readonly repository: MaterialStandardGroupRepository) {}

  fetchGroupMaterials(materialId: string) {
    return this.repository.fetchGroupWithMaterialsByMaterialId(materialId);
  }
}
