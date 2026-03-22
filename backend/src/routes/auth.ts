import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateInitData } from '../lib/telegram-auth.js';

const authBodySchema = z.object({
  initData: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Validate Telegram initData and return user info
  fastify.post('/validate', async (request, reply) => {
    try {
      const body = authBodySchema.parse(request.body);
      
      const telegramData = validateInitData(body.initData, fastify.env.TELEGRAM_BOT_TOKEN);
      
      if (!telegramData) {
        return reply.status(401).send({
          error: 'Invalid Telegram initData',
        });
      }
      
      return {
        user: telegramData.user,
        queryId: telegramData.query_id,
        startParam: telegramData.start_param,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Invalid request body',
          details: error.errors,
        });
      }
      
      fastify.log.error('Auth validation error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
      });
    }
  });
}
