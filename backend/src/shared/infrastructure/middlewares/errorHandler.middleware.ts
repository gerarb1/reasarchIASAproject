import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.constructor.name,
      message: err.message,
      details: err.details
    });
  }

  console.error('Unexpected Error:', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Ha ocurrido un error inesperado en el servidor'
  });
};
