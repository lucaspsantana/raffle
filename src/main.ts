import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  

  console.log('DATABASE_URL:', process.env.DATABASE_URL)

  
  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Configurar helmet para segurança HTTP
  app.use(helmet());
  
  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Fique Ryco API')
    .setDescription('Sistema de rifas online - API REST para gerenciamento de rifas e compra de bilhetes')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT de autenticação',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação e cadastro de usuários')
    .addTag('raffles', 'Gerenciamento de rifas')
    .addTag('tickets', 'Compra e consulta de bilhetes')
    .addTag('uploads', 'Upload de imagens')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
