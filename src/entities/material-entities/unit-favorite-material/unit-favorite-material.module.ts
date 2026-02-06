import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitFavoriteMaterial } from "./unit-favorite-material.model";
import { UnitFavoriteMaterialController } from "./unit-favorite-material.controller";
import { UnitFavoriteMaterialService } from "./unit-favorite-material.service";
import { UnitFavoriteMaterialRepository } from "./unit-favorite-material.repository";

@Module({
    imports: [SequelizeModule.forFeature([UnitFavoriteMaterial])],
    providers: [UnitFavoriteMaterialService, UnitFavoriteMaterialRepository],
    controllers: [UnitFavoriteMaterialController]
})

export class UnitFavoriteMaterialModule {}