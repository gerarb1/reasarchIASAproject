import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../../modules/users/application/services/TokenService.interface';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors/AppError';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (tokenService: TokenService) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticación no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verify(token);
    req.user = payload;
    next();
  };
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Acceso denegado: privilegios insuficientes');
    }

    next();
  };
};
