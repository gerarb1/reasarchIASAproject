import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Paper, PaperSchema } from '../../domain/entities/Paper';
import { PaperRepository } from '../../domain/repositories/PaperRepository.interface';
import { ProjectRepository } from '../../domain/repositories/ProjectRepository.interface';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/errors/AppError';

// Request Validation Schema
export const AddPaperSchema = z.object({
  projectId: z.string().uuid({ message: 'El ID del proyecto debe ser un UUID válido' }),
  title: z.string().min(3, { message: 'El título del paper debe tener al menos 3 caracteres' }),
  abstract: z.string().min(10, { message: 'El abstract del paper debe tener al menos 10 caracteres' }),
  authors: z.array(z.string().min(2)).min(1, { message: 'Debe haber al menos un autor' }),
  fileUrl: z.string().url({ message: 'El enlace del archivo debe ser una URL válida' })
});

export type AddPaperRequest = z.infer<typeof AddPaperSchema>;

export interface AddPaperResponse {
  id: string;
  projectId: string;
  title: string;
  abstract: string;
  authors: string[];
  fileUrl: string;
  status: string;
  uploadedById: string;
  createdAt: Date;
  isCleaned: boolean;
  cleanDataJson: string | null;
  ranking: string;
}

export class AddPaperToProjectUseCase {
  constructor(
    private readonly paperRepository: PaperRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async execute(
    request: AddPaperRequest,
    actor: { id: string; role: string }
  ): Promise<AddPaperResponse> {
    // 1. Zod input validation
    const validationResult = AddPaperSchema.safeParse(request);
    if (!validationResult.success) {
      throw new ValidationError('Datos de paper inválidos', validationResult.error.format());
    }

    const { projectId, title, abstract, authors, fileUrl } = validationResult.data;

    // 2. Retrieve Project and verify existence
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('El proyecto especificado no existe');
    }

    // 3. Enforce STUDENT Isolation (Data Ownership)
    if (actor.role === 'STUDENT') {
      if (project.studentId !== actor.id) {
        throw new ForbiddenError('No tienes permiso para agregar papers a este proyecto');
      }
    }

    // 4. Create Paper entity
    const paper: Paper = {
      id: randomUUID(),
      projectId,
      title,
      abstract,
      authors,
      fileUrl,
      status: 'PENDING_REVIEW',
      uploadedById: actor.id,
      createdAt: new Date(),
      isCleaned: false,
      cleanDataJson: null,
      ranking: 'UNRANKED'
    };

    // Strict validation of the entity itself
    const entityValidation = PaperSchema.safeParse(paper);
    if (!entityValidation.success) {
      throw new ValidationError('Fallo en la validación de la entidad Paper', entityValidation.error.format());
    }

    // 5. Persist
    const savedPaper = await this.paperRepository.save(paper);

    return {
      id: savedPaper.id,
      projectId: savedPaper.projectId,
      title: savedPaper.title,
      abstract: savedPaper.abstract,
      authors: savedPaper.authors,
      fileUrl: savedPaper.fileUrl,
      status: savedPaper.status,
      uploadedById: savedPaper.uploadedById,
      createdAt: savedPaper.createdAt,
      isCleaned: savedPaper.isCleaned,
      cleanDataJson: savedPaper.cleanDataJson,
      ranking: savedPaper.ranking
    };
  }
}
