import bcrypt from 'bcryptjs';
import { Hasher } from '../../application/services/Hasher.interface';

export class BCryptHasher implements Hasher {
  private readonly rounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.rounds);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}
