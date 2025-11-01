import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

export const buildServer = async () => {
  const app = Fastify({ logger: true });

  // Настройка CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      // В разработке разрешаем все источники, в продакшене можно указать конкретные домены
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
      
      // Если origin не указан (например, запросы из Postman), разрешаем
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // Регистрация роутов аутентификации
  await app.register(authRoutes, { prefix: '/auth' });

  return app;
};

buildServer()
  .then((app) => {
    return app.listen({ port, host });
  })
  .then((address) => {
    console.log(`Server listening at ${address}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

