import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '../lib/jwt';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

interface LoginBody {
  email?: string;
  username?: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // Регистрация
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    try {
      // Валидация входных данных
      const validatedData = registerSchema.parse(request.body);

      // Проверка уникальности email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUserByEmail) {
        reply.code(409).send({ error: 'Пользователь с таким email уже существует' });
        return;
      }

      // Проверка уникальности username
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUserByUsername) {
        reply.code(409).send({ error: 'Пользователь с таким именем уже существует' });
        return;
      }

      // Хеширование пароля
      const hashedPassword = await hashPassword(validatedData.password);

      // Создание пользователя
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: hashedPassword,
        },
      });

      // Генерация токенов
      const tokenPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Сохранение refresh token в БД
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      reply.code(201).send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
        },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400).send({ error: 'Ошибка валидации', details: error.errors });
        return;
      }

      if (error.code === 'P2002') {
        reply.code(409).send({ error: 'Пользователь с такими данными уже существует' });
        return;
      }

      fastify.log.error(error);
      reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Авторизация
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    try {
      // Валидация входных данных
      const validatedData = loginSchema.parse(request.body);

      // Поиск пользователя по email или username
      const user = await prisma.user.findFirst({
        where: validatedData.email
          ? { email: validatedData.email }
          : { username: validatedData.username! },
      });

      if (!user) {
        reply.code(401).send({ error: 'Неверный email/username или пароль' });
        return;
      }

      // Проверка пароля
      const isPasswordValid = await comparePassword(validatedData.password, user.password);

      if (!isPasswordValid) {
        reply.code(401).send({ error: 'Неверный email/username или пароль' });
        return;
      }

      // Генерация токенов
      const tokenPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Сохранение refresh token в БД
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      reply.send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
        },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400).send({ error: 'Ошибка валидации', details: error.errors });
        return;
      }

      fastify.log.error(error);
      reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Обновление токена
  fastify.post<{ Body: RefreshTokenBody }>('/refresh', async (request, reply) => {
    try {
      // Валидация входных данных
      const validatedData = refreshTokenSchema.parse(request.body);

      // Проверка refresh token в БД
      const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: { token: validatedData.refreshToken },
        include: { user: true },
      });

      if (!refreshTokenRecord) {
        reply.code(401).send({ error: 'Недействительный refresh token' });
        return;
      }

      // Проверка срока действия
      if (new Date() > refreshTokenRecord.expiresAt) {
        // Удаляем истекший токен
        await prisma.refreshToken.delete({
          where: { id: refreshTokenRecord.id },
        });
        reply.code(401).send({ error: 'Refresh token истек' });
        return;
      }

      // Верификация токена
      let tokenPayload: JwtPayload;
      try {
        tokenPayload = verifyRefreshToken(validatedData.refreshToken);
      } catch (error) {
        reply.code(401).send({ error: 'Недействительный refresh token' });
        return;
      }

      // Генерация новых токенов
      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // Удаление старого refresh token
      await prisma.refreshToken.delete({
        where: { id: refreshTokenRecord.id },
      });

      // Сохранение нового refresh token в БД
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: refreshTokenRecord.userId,
          expiresAt,
        },
      });

      reply.send({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400).send({ error: 'Ошибка валидации', details: error.errors });
        return;
      }

      fastify.log.error(error);
      reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Получение текущего пользователя
  fastify.get('/me', { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user!.userId },
      });

      if (!user) {
        reply.code(404).send({ error: 'Пользователь не найден' });
        return;
      }

      reply.send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Logout
  fastify.post<{ Body: RefreshTokenBody }>('/logout', async (request, reply) => {
    try {
      // Валидация входных данных
      const validatedData = refreshTokenSchema.parse(request.body);

      // Удаление refresh token из БД
      const deletedToken = await prisma.refreshToken.deleteMany({
        where: { token: validatedData.refreshToken },
      });

      if (deletedToken.count === 0) {
        reply.code(404).send({ error: 'Refresh token не найден' });
        return;
      }

      reply.send({ message: 'Выход выполнен успешно' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        reply.code(400).send({ error: 'Ошибка валидации', details: error.errors });
        return;
      }

      fastify.log.error(error);
      reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
    }
  });
}

