import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа').max(30, 'Имя пользователя должно содержать максимум 30 символов'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов').max(100, 'Пароль должен содержать максимум 100 символов'),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес').optional(),
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа').optional(),
  password: z.string().min(1, 'Пароль обязателен'),
}).refine((data) => data.email || data.username, {
  message: 'Необходимо указать email или username',
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

