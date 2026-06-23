import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Project, ProjectSchema } from '../../domain/entities/Project';
import { ProjectRepository } from '../../domain/repositories/ProjectRepository.interface';
import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/errors/AppError';

// Request Validation Schema
export const CreateProjectSchema = z.object({
  title: z.string().min(3, { message: 'El título del proyecto debe tener al menos 3 caracteres' }),
  description: z.string().min(5, { message: 'La descripción del proyecto debe tener al menos 5 caracteres' }),
  studentId: z.string().uuid({ message: 'El ID del estudiante asignado debe ser un UUID válido' })
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;

export interface CreateProjectResponse {
  id: string;
  title: string;
  description: string;
  studentId: string;
  ownerId: string;
  status: string;
  createdAt: Date;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    request: CreateProjectRequest,
    actor: { id: string; role: string }
  ): Promise<CreateProjectResponse> {
    // 1. Enforce authorization: Actor must be ADMIN
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenError('Solo los administradores pueden crear proyectos');
    }

    // 2. Validate request using Zod (strictly required for ADMIN too)
    const validationResult = CreateProjectSchema.safeParse(request);
    if (!validationResult.success) {
      throw new ValidationError('Datos de proyecto inválidos', validationResult.error.format());
    }

    const { title, description, studentId } = validationResult.data;

    // 3. Verify student existence and role
    const student = await this.userRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('El estudiante asignado no existe');
    }
    if (student.role !== 'STUDENT') {
      throw new ValidationError('El usuario asignado debe tener el rol de STUDENT');
    }

    // 4. Create entity and validate against full Project Schema
    const project: Project = {
      id: randomUUID(),
      title,
      description,
      studentId,
      ownerId: actor.id,
      status: 'ACTIVE',
      createdAt: new Date()
    };

    // Strict validation of the entity itself
    const entityValidation = ProjectSchema.safeParse(project);
    if (!entityValidation.success) {
      throw new ValidationError('Fallo en la validación de la entidad Project', entityValidation.error.format());
    }

    // 5. Persist
    const savedProject = await this.projectRepository.save(project);

    return {
      id: savedProject.id,
      title: savedProject.title,
      description: savedProject.description,
      studentId: savedProject.studentId,
      ownerId: savedProject.ownerId,
      status: savedProject.status,
      createdAt: savedProject.createdAt
    };
  }
}
