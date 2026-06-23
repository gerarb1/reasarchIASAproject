import jwt from 'jsonwebtoken';
import { TokenPayload, TokenService } from '../../application/services/TokenService.interface';
import { UnauthorizedError } from '../../../../shared/domain/errors/AppError';

export class JWTService implements TokenService {
  private readonly secretKey: string;
  private readonly expiresIn = '1h';

  constructor(secretKey: string = process.env.JWT_SECRET || 'super-secret-key-12345') {
    this.secretKey = secretKey;
  }

  generate(payload: TokenPayload): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey) as any;
      return {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch {
      throw new UnauthorizedError('Token de autenticación inválido o expirado');
    }
  }
}
