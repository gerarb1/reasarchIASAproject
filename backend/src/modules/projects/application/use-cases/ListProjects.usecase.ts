import { ProjectRepository } from '../../domain/repositories/ProjectRepository.interface';
import { Project } from '../../domain/entities/Project';

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
