import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Stock } from './stock.model';
import { Unit } from 'src/entities/unit-entities/unit/unit.model';
import { StockController } from './stock.controller';
import { UnitHierarchyService } from 'src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service';
import { UnitHierarchyRepository } from 'src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.repository';
import { StockRepository } from './stock.repositroy';
import { StockService } from './stock.service';
import { UnitStatusRepository } from 'src/entities/unit-entities/units-statuses/units-statuses.repository';
import { ReportRoutingRepository } from 'src/entities/report-entities/report/report-routing.repository';
import { UserRepository } from 'src/entities/unit-entities/users/user.repository';
import { UnitStatus } from 'src/entities/unit-entities/units-statuses/units-statuses.model';
import { UnitRelation } from 'src/entities/unit-entities/unit-relations/unit-relation.model';
import { Report } from 'src/entities/report-entities/report/report.model';
import { User } from 'src/entities/unit-entities/users/user.model';
import { MaterialStandardGroupRepository } from 'src/entities/standard-entities/material-standard-group/material-standard-group.repository';
import { MaterialStandardGroup } from 'src/entities/standard-entities/material-standard-group/material-standard-group.model';

@Module({
  imports: [SequelizeModule.forFeature([Unit, Stock, UnitStatus, UnitRelation, Report, User, MaterialStandardGroup])],
  controllers: [StockController],
  providers: [
    UnitHierarchyService,
    UnitHierarchyRepository,
    UnitStatusRepository,
    ReportRoutingRepository,
    UserRepository,
    StockService,
    StockRepository,
    MaterialStandardGroupRepository
  ],
  exports: [StockService, StockRepository],
})
export class StocksModule {}
