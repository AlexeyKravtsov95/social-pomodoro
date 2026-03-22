import { FastifyInstance } from 'fastify';
import { Env } from '../config/env.js';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
    prisma: PrismaClient;
  }
  
  interface FastifyRequest {
    telegramUser?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  }
}
