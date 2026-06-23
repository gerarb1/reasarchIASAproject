import { ReviewPaperUseCase } from './ReviewPaper.usecase';
import { PaperRepository } from '../../domain/repositories/PaperRepository.interface';
import { Paper } from '../../domain/entities/Paper';
import { ForbiddenError, ValidationError } from '../../../../shared/domain/errors/AppError';

describe('ReviewPaperUseCase', () => {
  let useCase: ReviewPaperUseCase;
  let mockPaperRepository: jest.Mocked<PaperRepository>;

  const originalPaper: Paper = {
    id: '11111111-1111-1111-1111-111111111111',
    projectId: '22222222-2222-2222-2222-222222222222',
    title: 'Paper Científico Original',
    abstract: 'Abstract original sobre física cuántica.',
    authors: ['Albert Einstein'],
    fileUrl: 'https://physics.org/einstein.pdf',
    status: 'PENDING_REVIEW',
    uploadedById: '33333333-3333-3333-3333-333333333333',
    createdAt: new Date(),
    isCleaned: false,
    cleanDataJson: null,
    ranking: 'UNRANKED'
  };

  beforeEach(() => {
    mockPaperRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByProjectId: jest.fn(),
      findAll: jest.fn()
    };
    useCase = new ReviewPaperUseCase(mockPaperRepository);
  });

  it('debería permitir a un DATA_CLEANER revisar un paper y actualizar campos de limpieza', async () => {
    mockPaperRepository.findById.mockResolvedValue(originalPaper);
    mockPaperRepository.save.mockImplementation(async (paper) => paper);

    const request = {
      paperId: originalPaper.id,
      status: 'APPROVED' as const,
      isCleaned: true,
      cleanDataJson: '{"key": "value"}',
      ranking: 'Q1' as const
    };

    const response = await useCase.execute(request, { id: 'cleaner-id', role: 'DATA_CLEANER' });

    expect(response.status).toBe('APPROVED');
    expect(response.isCleaned).toBe(true);
    expect(response.cleanDataJson).toBe('{"key": "value"}');
    expect(response.ranking).toBe('Q1');
    expect(mockPaperRepository.save).toHaveBeenCalled();
  });

  it('debería prohibir a un DATA_CLEANER cambiar el título original del paper', async () => {
    mockPaperRepository.findById.mockResolvedValue(originalPaper);

    const request = {
      paperId: originalPaper.id,
      status: 'APPROVED' as const,
      isCleaned: true,
      cleanDataJson: '{}',
      ranking: 'Q1' as const,
      title: 'TÍTULO ALTERADO POR CLEANER'
    };

    await expect(
      useCase.execute(request, { id: 'cleaner-id', role: 'DATA_CLEANER' })
    ).rejects.toThrow(ForbiddenError);
  });

  it('debería prohibir a un DATA_CLEANER cambiar el archivo PDF original', async () => {
    mockPaperRepository.findById.mockResolvedValue(originalPaper);

    const request = {
      paperId: originalPaper.id,
      status: 'APPROVED' as const,
      isCleaned: true,
      cleanDataJson: '{}',
      ranking: 'Q2' as const,
      fileUrl: 'https://hacked-server.org/malicious.pdf'
    };

    await expect(
      useCase.execute(request, { id: 'cleaner-id', role: 'DATA_CLEANER' })
    ).rejects.toThrow(ForbiddenError);
  });

  it('debería permitir a un ADMIN cambiar el título original o PDF si fuera necesario (no aplica restricción de inmutabilidad del cleaner)', async () => {
    mockPaperRepository.findById.mockResolvedValue(originalPaper);
    mockPaperRepository.save.mockImplementation(async (paper) => paper);

    const request = {
      paperId: originalPaper.id,
      status: 'APPROVED' as const,
      isCleaned: true,
      cleanDataJson: '{}',
      ranking: 'Q3' as const,
      title: 'Título Ajustado por Admin',
      fileUrl: 'https://physics.org/einstein-revised.pdf'
    };

    // Al ser ADMIN, no debe lanzar ForbiddenError por inmutabilidad,
    // y debe dejar que el paper mantenga estos campos si la lógica lo permite.
    // En nuestro caso, la lógica mapea: updatedPaper = { ...paper, status, isCleaned, cleanDataJson, ranking }
    // y si es ADMIN, no valida contra el título de entrada ya que no le aplica el check.
    const response = await useCase.execute(request, { id: 'admin-id', role: 'ADMIN' });
    expect(response.ranking).toBe('Q3');
  });

  it('debería lanzar un error de validación (Zod) si el ranking es inválido, incluso para un ADMIN', async () => {
    mockPaperRepository.findById.mockResolvedValue(originalPaper);

    const request = {
      paperId: originalPaper.id,
      status: 'APPROVED' as const,
      isCleaned: true,
      cleanDataJson: '{}',
      ranking: 'Q5' as any // Invalid ranking
    };

    await expect(
      useCase.execute(request, { id: 'admin-id', role: 'ADMIN' })
    ).rejects.toThrow(ValidationError);
  });
});
