import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { MaterialCategory } from "./material-category.model";

@Module({
    imports: [SequelizeModule.forFeature([MaterialCategory])]
})

export class MaterialCategoryModule { }