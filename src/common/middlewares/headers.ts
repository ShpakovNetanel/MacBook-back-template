import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class HeadersMiddeware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const date = req.headers['screendate'];
        const user = req.headers['user'];

        if (!date) throw new UnauthorizedException('Missing authorization headers');

        req['date'] = date;
        req['username'] = 'S9107544';
        next();
    }
}