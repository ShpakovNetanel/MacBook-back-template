import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class HeadersMiddeware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const date = req.headers['screendate'];

        if (!date) throw new UnauthorizedException('Missing authorization headers');

        req['date'] = date as string;
        req['username'] = req.headers['username'] as string;
        next();
    }
}
