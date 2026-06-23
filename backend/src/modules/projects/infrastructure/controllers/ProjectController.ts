import { Router, Response, NextFunction } from 'express';
import { CreateProjectUseCase } from '../../application/use-cases/CreateProject.usecase';
import { AddPaperToProjectUseCase } from '../../application/use-cases/AddPaperToProject.usecase';
import { GetProjectDetailsUseCase } from '../../application/use-cases/GetProjectDetails.usecase';
import { ReviewPaperUseCase } from '../../application/use-cases/ReviewPaper.usecase';
import { ListProjectsUseCase } from '../../application/use-cases/ListProjects.usecase';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/middlewares/auth.middleware';

export class ProjectController {
  public readonly router = Router();

  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly addPaperToProjectUseCase: AddPaperToProjectUseCase,
    private readonly getProjectDetailsUseCase: GetProjectDetailsUseCase,
    private readonly reviewPaperUseCase: ReviewPaperUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly authenticateMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void,
    private readonly requireAdminMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void,
    private readonly requireCleanerOrAdminMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    // 1. Create project (ADMIN only)
    this.router.post(
      '/',
      this.authenticateMiddleware,
      this.requireAdminMiddleware,
      this.createProject.bind(this)
    );

    // 2. List projects (All authenticated roles)
    this.router.get(
      '/',
      this.authenticateMiddleware,
      this.listProjects.bind(this)
    );

    // 3. Get project details with papers (All authenticated, with student isolation filters)
    this.router.get(
      '/:id',
      this.authenticateMiddleware,
      this.getProjectDetails.bind(this)
    );

    // 4. Add paper to project (All authenticated, with student project assignment checks)
    this.router.post(
      '/:id/papers',
      this.authenticateMiddleware,
      this.addPaperToProject.bind(this)
    );

    // 5. Review/Clean paper (DATA_CLEANER and ADMIN only, enforces immutability of original)
    this.router.put(
      '/papers/:paperId/review',
      this.authenticateMiddleware,
      this.requireCleanerOrAdminMiddleware,
      this.reviewPaper.bind(this)
    );
  }

  private async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.createProjectUseCase.execute(req.body, {
        id: req.user!.userId,
        role: req.user!.role
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async listProjects(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.listProjectsUseCase.execute();
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async getProjectDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.getProjectDetailsUseCase.execute(req.params.id, {
        id: req.user!.userId,
        role: req.user!.role
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async addPaperToProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestPayload = {
        ...req.body,
        projectId: req.params.id
      };
      const response = await this.addPaperToProjectUseCase.execute(requestPayload, {
        id: req.user!.userId,
        role: req.user!.role
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async reviewPaper(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestPayload = {
        ...req.body,
        paperId: req.params.paperId
      };
      const response = await this.reviewPaperUseCase.execute(requestPayload, {
        id: req.user!.userId,
        role: req.user!.role
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
