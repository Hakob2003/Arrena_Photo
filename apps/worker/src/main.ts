import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import * as http from 'http';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks(); // WRK-029
  console.log('Worker is running...');

  // Start a dummy HTTP server to satisfy Render's port scan if deployed as a Web Service
  const port = process.env.PORT || 10000;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker is running and healthy\n');
  });
  
  server.listen(port, () => {
    console.log(`Dummy HTTP server listening on port ${port} for health checks`);
  });
}
bootstrap();
