import { Paper } from '../entities/Paper';

export interface PaperRepository {
  findById(id: string): Promise<Paper | null>;
  save(paper: Paper): Promise<Paper>;
  findByProjectId(projectId: string): Promise<Paper[]>;
  findAll(): Promise<Paper[]>;
}
