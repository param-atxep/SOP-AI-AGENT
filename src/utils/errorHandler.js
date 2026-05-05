import logger from './logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled request error');

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });



  
};
