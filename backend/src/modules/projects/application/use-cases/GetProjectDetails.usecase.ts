import { ProjectRepository } from '../../domain/repositories/ProjectRepository.interface';
import { PaperRepository } from '../../domain/repositories/PaperRepository.interface';
import { NotFoundError } from '../../../../shared/domain/errors/AppError';
import { Paper } from '../../domain/entities/Paper';

export interface ProjectDetailsResponse {
  id: string;
  title: string;
  description: string;
  studentId: string;
  ownerId: string;
  status: string;
  createdAt: Date;
  papers: Paper[];
}

export class GetProjectDetailsUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly paperRepository: PaperRepository
  ) {}

  async execute(
    projectId: string,
    actor: { id: string; role: string }
  ): Promise<ProjectDetailsResponse> {
    // 1. Fetch project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('El proyecto no existe');
    }

    // 2. Fetch all papers for this project
    const papers = await this.paperRepository.findByProjectId(projectId);

    // 3. Filter papers according to Student Isolation rules
    let filteredPapers: Paper[] = [];

    if (actor.role === 'STUDENT') {
      if (project.studentId === actor.id) {
        // Assigned student can see all papers in this project
        filteredPapers = papers;
      } else {
        // Other students can only see papers that are APPROVED (public)
        filteredPapers = papers.filter(p => p.status === 'APPROVED');
      }
    } else {
      // ADMIN and DATA_CLEANER can see all papers
      filteredPapers = papers;
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      studentId: project.studentId,
      ownerId: project.ownerId,
      status: project.status,
      createdAt: project.createdAt,
      papers: filteredPapers
    };
  }
}
