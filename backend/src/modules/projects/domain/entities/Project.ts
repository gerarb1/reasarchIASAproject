import { z } from 'zod';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface Project {
  id: string;
  title: string;
  description: string;
  studentId: string; // The assigned student ID
  ownerId: string;   // The ADMIN who created the project
  status: ProjectStatus;
  createdAt: Date;
}

export const ProjectStatusSchema = z.enum(['ACTIVE', 'ARCHIVED']);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, { message: 'El título del proyecto debe tener al menos 3 caracteres' }),
  description: z.string().min(5, { message: 'La descripción del proyecto debe tener al menos 5 caracteres' }),
  studentId: z.string().uuid({ message: 'El ID del estudiante asignado debe ser un UUID válido' }),
  ownerId: z.string().uuid({ message: 'El ID del administrador propietario debe ser un UUID válido' }),
  status: ProjectStatusSchema.default('ACTIVE'),
  createdAt: z.date().default(() => new Date())
});
