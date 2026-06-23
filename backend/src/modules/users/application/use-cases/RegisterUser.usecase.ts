import { randomUUID } from 'crypto';
import { z } from 'zod';
import { User, UserRole, UserRoleSchema } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository.interface';
import { Hasher } from '../services/Hasher.interface';
import { ConflictError, ValidationError } from '../../../../shared/domain/errors/AppError';

// Request Validation Schema
export const RegisterUserSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'El correo electrónico no es válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: UserRoleSchema
});

export type RegisterUserRequest = z.infer<typeof RegisterUserSchema>;

export interface RegisterUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: Hasher
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // 1. Zod Validation
    const validationResult = RegisterUserSchema.safeParse(request);
    if (!validationResult.success) {
      throw new ValidationError('Datos de registro inválidos', validationResult.error.format());
    }

    const data = validationResult.data;

    // 2. Business Check: Duplicate email
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }

    // 3. Hash Password
    const hashedPassword = await this.hasher.hash(data.password);

    // 4. Create User Entity
    const user: User = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      createdAt: new Date()
    };

    // 5. Persist
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt
    };
  }
}
