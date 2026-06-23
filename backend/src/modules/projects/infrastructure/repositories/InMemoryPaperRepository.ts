import { Paper } from '../../domain/entities/Paper';
import { PaperRepository } from '../../domain/repositories/PaperRepository.interface';

export class InMemoryPaperRepository implements PaperRepository {
  private readonly papers: Map<string, Paper> = new Map();

  async findById(id: string): Promise<Paper | null> {
    return this.papers.get(id) || null;
  }

  async save(paper: Paper): Promise<Paper> {
    this.papers.set(paper.id, paper);
    return paper;
  }

  async findByProjectId(projectId: string): Promise<Paper[]> {
    const results: Paper[] = [];
    for (const paper of this.papers.values()) {
      if (paper.projectId === projectId) {
        results.push(paper);
      }
    }
    return results;
  }

  async findAll(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }
}
