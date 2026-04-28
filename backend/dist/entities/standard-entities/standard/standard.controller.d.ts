import { StandardService } from "./standard.service";
import { StandardResponse } from "./standard.types";
export declare class StandardController {
    private readonly service;
    constructor(service: StandardService);
    getToolMaterialIds(request: Request): Promise<string[]>;
    getStandard(request: Request): Promise<StandardResponse>;
}
