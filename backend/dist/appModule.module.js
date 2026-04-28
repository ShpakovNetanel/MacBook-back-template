"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const constants_1 = require("./constants");
const modules_1 = __importDefault(require("./modules"));
const sequelizeInitializer = (configService) => constants_1.ENVIRONMENTS.NONPROD === configService.get('ENVIRONMENT')
    ? {
        host: configService.get('DB_HOST'),
        password: configService.get('DB_PASSWORD'),
        username: configService.get('DB_USER'),
        database: configService.get('DB_NAME'),
    }
    : {
        host: configService.get('DB_HOST'),
        username: configService.get('DB_USER'),
        database: configService.get('DB_NAME')
    };
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    dialect: 'postgres',
                    ...sequelizeInitializer(configService),
                    port: parseInt(configService.get('DB_PORT'), 5432),
                    define: {
                        schema: configService.get('DB_SCHEMA', '')
                    },
                    hooks: {
                        afterConnect: async (connection) => {
                            await connection.query(`SET search_path TO ${configService.get('DB_SCHEMA', 'public')}`);
                        }
                    },
                    timezone: 'Asia/Jerusalem',
                    autoLoadModels: true,
                    synchronize: false,
                    logging: false,
                })
            }),
            ...modules_1.default
        ]
    })
], AppModule);
//# sourceMappingURL=appModule.module.js.map