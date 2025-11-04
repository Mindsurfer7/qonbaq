import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

export const buildServer = async () => {
  const app = Fastify({ logger: true });

  // Настройка CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      // В продакшене проверяем конкретные домены, в разработке разрешаем все
      if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN) {
        const allowedOrigins = process.env.CORS_ORIGIN.split(',');
        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      } else {
        // В разработке разрешаем все источники (включая Flutter emulator/device)
        cb(null, true);
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

  // Регистрация роутов пользователя
  await app.register(userRoutes, { prefix: '/api/user' });

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

