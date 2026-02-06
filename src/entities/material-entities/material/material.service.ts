import { Inject, Injectable } from "@nestjs/common";
import { MaterialRepository } from "./material.repository";
import { log } from "console";

@Injectable()
export class MaterialService {
    constructor(private readonly repository: MaterialRepository) { }

    async fetchTwenty(filter: string) {
        const materials = await this.repository.fetchAll(filter);

        return materials.slice(0, 20).map(material => ({
            ...material.dataValues,
            multiply: Number(material.dataValues.multiply),
            category: material.materialCategory?.mainCategory?.dataValues.description   
        }));
    }
}