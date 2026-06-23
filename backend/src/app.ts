import express, { Express } from 'express';
import bcryptjs from 'bcryptjs';

// Shared
import { errorHandler } from './shared/infrastructure/middlewares/errorHandler.middleware';
import { authenticate, requireRole } from './shared/infrastructure/middlewares/auth.middleware';
import { getDocsHtml } from './shared/infrastructure/views/docs';

// Users Module
import { InMemoryUserRepository } from './modules/users/infrastructure/repositories/InMemoryUserRepository';
import { BCryptHasher } from './modules/users/infrastructure/services/BCryptHasher';
import { JWTService } from './modules/users/infrastructure/services/JWTService';
import { RegisterUserUseCase } from './modules/users/application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from './modules/users/application/use-cases/LoginUser.usecase';
import { GetUserProfileUseCase } from './modules/users/application/use-cases/GetUserProfile.usecase';
import { ListUsersUseCase } from './modules/users/application/use-cases/ListUsers.usecase';
import { UserController } from './modules/users/infrastructure/controllers/UserController';

// Projects Module
import { InMemoryProjectRepository } from './modules/projects/infrastructure/repositories/InMemoryProjectRepository';
import { InMemoryPaperRepository } from './modules/projects/infrastructure/repositories/InMemoryPaperRepository';
import { CreateProjectUseCase } from './modules/projects/application/use-cases/CreateProject.usecase';
import { AddPaperToProjectUseCase } from './modules/projects/application/use-cases/AddPaperToProject.usecase';
import { GetProjectDetailsUseCase } from './modules/projects/application/use-cases/GetProjectDetails.usecase';
import { ReviewPaperUseCase } from './modules/projects/application/use-cases/ReviewPaper.usecase';
import { ListProjectsUseCase } from './modules/projects/application/use-cases/ListProjects.usecase';
import { ProjectController } from './modules/projects/infrastructure/controllers/ProjectController';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  // 1. Instantiate Infrastructure Adapters (Repositories & Services)
  const userRepository = new InMemoryUserRepository();
  const projectRepository = new InMemoryProjectRepository();
  const paperRepository = new InMemoryPaperRepository();

  const hasher = new BCryptHasher();
  const tokenService = new JWTService();

  // 2. Setup Middlewares
  const authMiddleware = authenticate(tokenService);
  const adminMiddleware = requireRole(['ADMIN']);
  const cleanerOrAdminMiddleware = requireRole(['DATA_CLEANER', 'ADMIN']);

  // 3. Instantiate Use Cases
  // Users
  const registerUserUseCase = new RegisterUserUseCase(userRepository, hasher);
  const loginUserUseCase = new LoginUserUseCase(userRepository, hasher, tokenService);
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);

  // Projects
  const createProjectUseCase = new CreateProjectUseCase(projectRepository, userRepository);
  const addPaperToProjectUseCase = new AddPaperToProjectUseCase(paperRepository, projectRepository);
  const getProjectDetailsUseCase = new GetProjectDetailsUseCase(projectRepository, paperRepository);
  const reviewPaperUseCase = new ReviewPaperUseCase(paperRepository);
  const listProjectsUseCase = new ListProjectsUseCase(projectRepository);

  // 4. Instantiate Controllers
  const userController = new UserController(
    registerUserUseCase,
    loginUserUseCase,
    getUserProfileUseCase,
    listUsersUseCase,
    authMiddleware,
    adminMiddleware
  );

  const projectController = new ProjectController(
    createProjectUseCase,
    addPaperToProjectUseCase,
    getProjectDetailsUseCase,
    reviewPaperUseCase,
    listProjectsUseCase,
    authMiddleware,
    adminMiddleware,
    cleanerOrAdminMiddleware
  );

  // 5. Seed default admin user for convenience (synchronously to avoid test race conditions)
  const hashedPassword = bcryptjs.hashSync('adminpassword123', 10);
  userRepository.save({
    id: '00000000-0000-0000-0000-000000000000',
    name: 'System Administrator',
    email: 'admin@research.com',
    password: hashedPassword,
    role: 'ADMIN',
    createdAt: new Date()
  });

  // 6. Bind Routes
  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Plataforma de Investigación Científica API v1',
      uptime: `${Math.floor(process.uptime())}s`
    });
  });

  app.get('/api/v1/docs', (_req, res) => {
    res.send(getDocsHtml());
  });

  app.use('/api/v1/users', userController.router);
  app.use('/api/v1/projects', projectController.router);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
  });

  // 7. Global Error Handler Middleware
  app.use(errorHandler);

  return app;
}
