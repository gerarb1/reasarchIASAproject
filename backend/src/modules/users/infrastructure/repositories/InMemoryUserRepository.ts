import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository.interface';

export class InMemoryUserRepository implements UserRepository {
  private readonly users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}
