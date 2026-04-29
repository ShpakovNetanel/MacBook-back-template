import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MaterialStandardGroup } from './material-standard-group.model';
import { Material } from '../../material-entities/material/material.model';
import { StandardGroup } from '../standard-group/standard-group.model';

@Injectable()
export class MaterialStandardGroupRepository {
  constructor(
    @InjectModel(MaterialStandardGroup)
    private readonly materialStandardGroupModel: typeof MaterialStandardGroup,
  ) {}

  async fetchMaterialsByGroupId(groupId: string) {
    const relatedMaterials = await this.materialStandardGroupModel.findAll({
      where: { groupId },
    });

    return relatedMaterials.map(
      (relatedMaterial) => relatedMaterial.dataValues.materialId,
    );
  }

  async fetchGroupWithMaterialsByMaterialId(material: string) {
    const materialGroup = await this.materialStandardGroupModel.findOne({
      where: { materialId: material },
      include: [{ model: StandardGroup, attributes: ['id', 'name'] }],
    });

    const groupId = materialGroup ? materialGroup.dataValues.groupId : material;
    const groupName = materialGroup
      ? materialGroup.standardGroup?.dataValues.name
      : null;

    const groupMaterials = await this.materialStandardGroupModel.findAll({
      where: { groupId },
      include: [{ model: Material, attributes: ['id', 'description'] }],
    });

    return {
      groupId,
      groupName,
      materials: groupMaterials.map((groupMaterial) => ({
        materialId: groupMaterial.dataValues.materialId,
        description: groupMaterial.material?.dataValues?.description ?? null,
      })),
    };
  }
}
