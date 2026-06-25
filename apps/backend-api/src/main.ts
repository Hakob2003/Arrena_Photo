import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  console.log('Starting NestJS application...');
  try {
    const app = await NestFactory.create(AppModule);

    // Global Middlewares
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        process.env.FRONTEND_URL || 'https://arrena-photo-frontend-o4xg.onrender.com',
      ],
      credentials: true,
    });
    
    // Increase body size limits for base64 image uploads
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // API Versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Swagger Documentation Setup
    const config = new DocumentBuilder()
      .setTitle('AI Template Studio API')
      .setDescription('The core API for AI Template Studio SaaS')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`Attempting to bind to port ${port}...`);
    // Omit '0.0.0.0' so Node binds to both IPv4 and IPv6 (::)
    await app.listen(port);
    console.log(`Backend API successfully bound and running on port ${port}`);
  } catch (error) {
    console.error('Failed to start NestJS application:', error);
    process.exit(1);
  }
}
bootstrap();
