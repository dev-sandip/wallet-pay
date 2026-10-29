// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js';
import { TrimBodyInterceptor } from './common/interceptors/trim-body.interceptor.js';
import { SanitizeResponseInterceptor } from './common/interceptors/sanitize-response.interceptor.js';
import { getEnv } from './env.js';
import { Logger } from '@nestjs/common';
import { setupSwagger } from './common/utils/swagger.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const swaggerEnabled = getEnv('SWAGGER_ENABLED');

  if (swaggerEnabled) {
    await setupSwagger(app);
  }

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new TimeoutInterceptor(),
    new TrimBodyInterceptor(),
    new SanitizeResponseInterceptor(),
  );

  await app.listen(getEnv('PORT'));

  logger.log(`Application is running at ${await app.getUrl()}`);
  if (swaggerEnabled) {
    logger.log(`Swagger docs available at ${await app.getUrl()}/docs`);
  }
}
await bootstrap();
