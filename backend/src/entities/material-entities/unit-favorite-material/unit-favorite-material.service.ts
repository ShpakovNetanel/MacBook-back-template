import { BadGatewayException, Injectable } from "@nestjs/common";
import { MESSAGE_TYPES } from "../../../constants";
import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";
import { UnitFavoriteMaterialRepository } from "./unit-favorite-material.repository";

@Injectable()
export class UnitFavoriteMaterialService {
    constructor(private readonly repository: UnitFavoriteMaterialRepository) { }

    async create(unitFavoriteMaterial: CreateUnitFavoriteMaterial) {
        try {
            return await this.repository.create(unitFavoriteMaterial);
        } catch (error) {
            console.log(error);
            throw new BadGatewayException({
                message: 'שמירת חומר מועדף נכשלה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            });
        }
    }

    async destroy(unitFavoriteMaterial: DeleteUnitFavoriteMaterial) {
        try {
            const deletedCount = await this.repository.destroy(unitFavoriteMaterial);

            return {
                data: { deletedCount },
            };
        } catch (error) {
            console.log(error);
            throw new BadGatewayException({
                message: 'מחיקת חומר מועדף נכשלה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            });
        }
    }
}
