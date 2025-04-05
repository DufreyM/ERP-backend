import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚨 Aquí habilitamos CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: 'http://localhost:3001', // Dirección de tu frontend
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
