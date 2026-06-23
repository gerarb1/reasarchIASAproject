import { Project } from '../../domain/entities/Project';
import { ProjectRepository } from '../../domain/repositories/ProjectRepository.interface';

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects: Map<string, Project> = new Map();

  async findById(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async save(project: Project): Promise<Project> {
    this.projects.set(project.id, project);
    return project;
  }

  async findAll(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async findByStudentId(studentId: string): Promise<Project[]> {
    const results: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.studentId === studentId) {
        results.push(project);
      }
    }
    return results;
  }
}
