import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // We can run this as a standalone application instead of an HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const logger = new Logger('Worker');
  logger.log('BullMQ Worker is running and listening for jobs...');
  
  // Keep the process running
  app.enableShutdownHooks();
}
bootstrap();
