import { Router, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.usecase';
import { GetUserProfileUseCase } from '../../application/use-cases/GetUserProfile.usecase';
import { ListUsersUseCase } from '../../application/use-cases/ListUsers.usecase';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/middlewares/auth.middleware';

export class UserController {
  public readonly router = Router();

  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly authenticateMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void,
    private readonly requireAdminMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.get('/profile', this.authenticateMiddleware, this.getProfile.bind(this));
    this.router.get('/', this.authenticateMiddleware, this.requireAdminMiddleware, this.listUsers.bind(this));
  }

  private async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.registerUserUseCase.execute(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.loginUserUseCase.execute(req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user has been populated by the authenticateMiddleware
      const userId = req.user!.userId;
      const response = await this.getUserProfileUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  private async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filterRole = req.query.role as string | undefined;
      const response = await this.listUsersUseCase.execute(req.user!.role, filterRole);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
