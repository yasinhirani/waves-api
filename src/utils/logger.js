import pino from 'pino';
import { env, isProd } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  ...(isProd ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } })
});
