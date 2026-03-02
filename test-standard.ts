import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/appModule.module';
import { StandardService } from './src/entities/standard-entities/standard/standard.service';

async function bootstrap() {
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const service = app.get(StandardService);

        // Testing with unit 1 and today's date
        const data = await service.getStandardDrawerData(1, "2026-03-01T00:00:00.000Z");
        console.log("Returned Data Length:", data.length);
        console.log("Returned Data Sample:", JSON.stringify(data.slice(0, 2), null, 2));

        await app.close();
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
}
bootstrap();
