import { z } from 'zod';
import { Paper, PaperSchema, PaperStatusSchema, PaperRankingSchema } from '../../domain/entities/Paper';
import { PaperRepository } from '../../domain/repositories/PaperRepository.interface';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/errors/AppError';

// Request Validation Schema
export const ReviewPaperSchema = z.object({
  paperId: z.string().uuid({ message: 'El ID del paper debe ser un UUID válido' }),
  status: PaperStatusSchema,
  isCleaned: z.boolean(),
  cleanDataJson: z.string().nullable().refine((val) => {
    if (val === null) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'cleanDataJson debe ser un JSON válido o nulo' }),
  ranking: PaperRankingSchema,
  // If these are passed, we will check if they are trying to modify them
  title: z.string().optional(),
  fileUrl: z.string().optional()
});

export type ReviewPaperRequest = z.infer<typeof ReviewPaperSchema>;

export interface ReviewPaperResponse {
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

export class ReviewPaperUseCase {
  constructor(private readonly paperRepository: PaperRepository) {}

  async execute(
    request: ReviewPaperRequest,
    actor: { id: string; role: string }
  ): Promise<ReviewPaperResponse> {
    // 1. Enforce authorization: Only DATA_CLEANER and ADMIN can review
    if (actor.role !== 'DATA_CLEANER' && actor.role !== 'ADMIN') {
      throw new ForbiddenError('Solo los revisores de datos (DATA_CLEANER) y administradores pueden revisar papers');
    }

    // 2. Validate input parameters using Zod (including ranking enum constraint)
    const validationResult = ReviewPaperSchema.safeParse(request);
    if (!validationResult.success) {
      throw new ValidationError('Datos de revisión inválidos', validationResult.error.format());
    }

    const { paperId, status, isCleaned, cleanDataJson, ranking, title, fileUrl } = validationResult.data;

    // 3. Find original paper
    const paper = await this.paperRepository.findById(paperId);
    if (!paper) {
      throw new NotFoundError('El paper especificado no existe');
    }

    // 4. Enforce rule: DATA_CLEANER cannot modify PDF original fileUrl or title
    if (actor.role === 'DATA_CLEANER') {
      if (title !== undefined && title !== paper.title) {
        throw new ForbiddenError('El rol DATA_CLEANER no puede alterar el título original del paper');
      }
      if (fileUrl !== undefined && fileUrl !== paper.fileUrl) {
        throw new ForbiddenError('El rol DATA_CLEANER no puede modificar el archivo PDF original subido');
      }
    }

    // 5. Update cleaning fields and status
    const updatedPaper: Paper = {
      ...paper,
      status,
      isCleaned,
      cleanDataJson,
      ranking
    };

    // Strict validation of the entity structure before saving
    const entityValidation = PaperSchema.safeParse(updatedPaper);
    if (!entityValidation.success) {
      throw new ValidationError('Fallo en la validación del esquema del Paper actualizado', entityValidation.error.format());
    }

    // 6. Save
    const savedPaper = await this.paperRepository.save(updatedPaper);

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
