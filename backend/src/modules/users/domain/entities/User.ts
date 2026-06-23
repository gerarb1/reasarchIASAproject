import { z } from 'zod';

export type UserRole = 'ADMIN' | 'DATA_CLEANER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Hashed password
  role: UserRole;
  createdAt: Date;
}

// Zod schemas for validation
export const UserRoleSchema = z.enum(['ADMIN', 'DATA_CLEANER', 'STUDENT']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'El correo electrónico no es válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: UserRoleSchema,
  createdAt: z.date().default(() => new Date())
});

export type UserInput = z.infer<typeof UserSchema>;
