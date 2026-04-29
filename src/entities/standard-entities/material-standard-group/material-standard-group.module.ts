import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MaterialStandardGroup } from './material-standard-group.model';
import { MaterialStandardGroupController } from './material-standard-group.controller';
import { MaterialStandardGroupService } from './material-standard-group.service';
import { MaterialStandardGroupRepository } from './material-standard-group.repository';
import { Material } from '../../material-entities/material/material.model';

@Module({
  imports: [SequelizeModule.forFeature([MaterialStandardGroup, Material])],
  controllers: [MaterialStandardGroupController],
  providers: [MaterialStandardGroupService, MaterialStandardGroupRepository],
  exports: [MaterialStandardGroupRepository],
})
export class MaterialStandardGroupModule {}
