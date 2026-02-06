import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './appModule.module';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HeadersMiddeware } from './common/middlewares/headers';
import * as bodyParser from 'body-parser';

dotenv.config();

const https = require('https')
https.globalAgent = new https.Agent({
  ca: process.env.CERIFICATE_CA
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.get(HttpAdapterHost);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  });

  app.use(new HeadersMiddeware().use);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb' }));

  await app.listen(3000);
}

bootstrap();
