import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// Загружаем переменные окружения из .env файла
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
