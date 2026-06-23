import { Project } from '../entities/Project';

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<Project>;
  findAll(): Promise<Project[]>;
  findByStudentId(studentId: string): Promise<Project[]>;
}
