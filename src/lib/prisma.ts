import { PrismaClient } from '../generated/prisma-client/client.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Получаем корневую директорию проекта (на 2 уровня выше от src/lib/)
const rootDir = path.resolve(__dirname, '../..');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Используем DATABASE_URL из env, но если там относительный путь, то преобразуем его в абсолютный
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const resolvedDbUrl = dbUrl.startsWith('file:') && !path.isAbsolute(dbUrl.slice(5))
  ? `file:${path.join(rootDir, dbUrl.slice(5))}`
  : dbUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Инициализация подключения к БД
prisma.$connect().catch((err) => {
  console.error('Failed to connect to database:', err);
});

