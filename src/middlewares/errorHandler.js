import { isProd } from '../config/env.js';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || err.status || 500;
  if (err.type === 'entity.parse.failed') status = 400;
  if (err.type === 'entity.too.large') status = 413;

  if (status >= 500) (req.log ?? logger).error({ err }, 'Request failed');

  res.status(status).json({
    success: false,
    message: status >= 500 && isProd ? 'Internal server error' : err.message,
    ...(err.details && { errors: err.details }),
    ...(!isProd && status >= 500 && { stack: err.stack })
  });
};
