import { UserRepository } from '../../domain/repositories/UserRepository.interface';
import { UserRole } from '../../domain/entities/User';
import { ForbiddenError } from '../../../../shared/domain/errors/AppError';

export interface ListUsersResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    actorRole: string,
    filterRole?: string
  ): Promise<ListUsersResponse[]> {
    // 1. Authorize: Only ADMIN can list users
    if (actorRole !== 'ADMIN') {
      throw new ForbiddenError('Acceso denegado: solo el administrador puede listar usuarios');
    }

    // 2. Fetch all users from the repository
    const allUsers = await this.userRepository.findAll();

    // 3. Filter by role if specified
    let filteredUsers = allUsers;
    if (filterRole) {
      filteredUsers = allUsers.filter(user => user.role === filterRole);
    }

    // 4. Sanitize: Return DTOs excluding the password
    return filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
  }
}
