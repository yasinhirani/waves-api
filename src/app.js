import { randomUUID } from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // running behind a proxy / load balancer

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] || randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url === '/health' }
  })
);
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    methods: ['GET', 'HEAD', 'OPTIONS']
  })
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
);

app.use('/api', apiLimiter);
app.use('/api/v1', (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60');
  next();
});
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
