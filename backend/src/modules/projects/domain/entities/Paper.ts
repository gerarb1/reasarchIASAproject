import { z } from 'zod';

export type PaperStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type PaperRanking = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'UNRANKED';

export interface Paper {
  id: string;
  projectId: string;
  title: string;
  abstract: string;
  authors: string[];
  fileUrl: string;
  status: PaperStatus;
  uploadedById: string;
  createdAt: Date;
  
  // Cleaning fields
  isCleaned: boolean;
  cleanDataJson: string | null;
  ranking: PaperRanking;
}

export const PaperStatusSchema = z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED']);
export const PaperRankingSchema = z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'UNRANKED']);

export const PaperSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid({ message: 'El ID del proyecto debe ser un UUID válido' }),
  title: z.string().min(3, { message: 'El título del paper debe tener al menos 3 caracteres' }),
  abstract: z.string().min(10, { message: 'El abstract del paper debe tener al menos 10 caracteres' }),
  authors: z.array(z.string().min(2)).min(1, { message: 'Debe haber al menos un autor' }),
  fileUrl: z.string().url({ message: 'El enlace del archivo debe ser una URL válida' }),
  status: PaperStatusSchema.default('PENDING_REVIEW'),
  uploadedById: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  
  // Cleaning metadata
  isCleaned: z.boolean().default(false),
  cleanDataJson: z.string().nullable().default(null).refine((val) => {
    if (val === null) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'cleanDataJson debe ser un JSON válido o nulo' }),
  ranking: PaperRankingSchema.default('UNRANKED')
});
