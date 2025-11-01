import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, JwtPayload } from '../lib/jwt';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: JwtPayload;
}

export async function authenticateToken(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Токен авторизации не предоставлен' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    request.user = payload;
  } catch (error) {
    reply.code(401).send({ error: 'Недействительный или истекший токен' });
    return;
  }
}

