import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('DNS API')
    .setDescription('Specs for DNS API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  initSwagger(app);
  await app.listen(4000);
}
bootstrap();
