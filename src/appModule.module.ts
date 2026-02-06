import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { ENVIRONMENTS } from "./contants";
import modules from './modules';

const sequelizeInitializer = (configService: ConfigService) => {
    return [ENVIRONMENTS.LOCALHOST, ENVIRONMENTS.NONPROD].includes(configService.get<string>('ENVIRONMENT') ?? '')
        ? {
            host: configService.get<string>('DB_HOST'),
            password: configService.get<string>('DB_PASSWORD'),
            username: configService.get<string>('DB_USER'),
            database: configService.get<string>('DB_NAME')
        }
        : {
            host: configService.get<string>('DB_HOST'),
            user: configService.get<string>('DB_USER'),
            database: configService.get<string>('DB_NAME')
        }
}

@Module({
    imports: [
        ConfigModule.forRoot(),
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                dialect: 'postgres',
                ...sequelizeInitializer(configService),
                port: configService.get<number>('DB_PORT'),
                timezone: 'Asia/Jerusalem',
                autoLoadModels: true,
                synchronize: false,
                logging: false,
            })
        }),
        ...modules
    ]
})

export class AppModule { }
