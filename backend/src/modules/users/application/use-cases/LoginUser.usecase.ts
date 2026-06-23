import { z } from 'zod';
import { UserRepository } from '../../domain/repositories/UserRepository.interface';
import { Hasher } from '../services/Hasher.interface';
import { TokenService } from '../services/TokenService.interface';
import { UnauthorizedError, ValidationError } from '../../../../shared/domain/errors/AppError';

export const LoginUserSchema = z.object({
  email: z.string().email({ message: 'El correo electrónico no es válido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' })
});

export type LoginUserRequest = z.infer<typeof LoginUserSchema>;

export interface LoginUserResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: Hasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    // 1. Zod Validation
    const validationResult = LoginUserSchema.safeParse(request);
    if (!validationResult.success) {
      throw new ValidationError('Datos de login inválidos', validationResult.error.format());
    }

    const { email, password } = validationResult.data;

    // 2. Fetch User
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // 3. Verify Password
    const isPasswordValid = await this.hasher.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // 4. Generate Token
    const token = this.tokenService.generate({
      userId: user.id,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}
