import React, { useState } from 'react';
import {
  FileText,
  FileType,
  BookOpen,
  Star,
  Lightbulb,
  BarChart3,
  Send,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';

interface ReviewerDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

/** Simulated papers awaiting review */
const MOCK_PAPERS = [
  { id: '1', title: 'Machine Learning for Climate Prediction Models', ext: 'pdf', authors: 'García, J.; López, M.', pages: 24 },
  { id: '2', title: 'Análisis de Redes Neuronales en Diagnóstico Médico', ext: 'docx', authors: 'Rodríguez, A.; Torres, P.', pages: 18 },
  { id: '3', title: 'Quantum Computing Applications in Cryptography', ext: 'tex', authors: 'Smith, R.; Chen, W.', pages: 31 },
];

const QUALITY_OPTIONS = [
  { value: '', label: 'Seleccionar calificación...' },
  { value: 'Q1', label: 'Q1 — Excelente (Top 25%)' },
  { value: 'Q2', label: 'Q2 — Alto (25-50%)' },
  { value: 'Q3', label: 'Q3 — Medio (50-75%)' },
  { value: 'Q4', label: 'Q4 — Bajo (75-100%)' },
  { value: 'REJECTED', label: 'Rechazado — No cumple estándares' },
];

const EXT_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  docx: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  tex: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  txt: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-400',
};

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ showToast }) => {
  const [selectedPaper, setSelectedPaper] = useState(MOCK_PAPERS[0]);
  const [clarity, setClarity] = useState('');
  const [originality, setOriginality] = useState('');
  const [stateOfArt, setStateOfArt] = useState('');
  const [quality, setQuality] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarity || !originality || !stateOfArt || !quality) {
      showToast('Completa todos los campos de la rúbrica', 'error');
      return;
    }
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    showToast('Evaluación enviada correctamente', 'success');
    setClarity('');
    setOriginality('');
    setStateOfArt('');
    setQuality('');
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Paper Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {MOCK_PAPERS.map((paper) => (
          <button
            key={paper.id}
            onClick={() => setSelectedPaper(paper)}
            className={[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
              selectedPaper.id === paper.id
                ? 'bg-accent-50 text-accent-800 border border-accent-200 dark:bg-accent-950/40 dark:text-accent-300 dark:border-accent-800'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:text-slate-400 dark:border-zinc-800 dark:hover:bg-zinc-800',
            ].join(' ')}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{paper.title.slice(0, 35)}…</span>
          </button>
        ))}
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── LEFT: Document Viewer ── */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              Visor de Documento
            </h3>
            <Badge variant="info" className={EXT_COLORS[selectedPaper.ext]}>
              .{selectedPaper.ext.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {/* Simulated document preview */}
            <div className="flex flex-col items-center justify-center py-16 px-8 bg-slate-50/50 dark:bg-zinc-800/30 border-b border-slate-100 dark:border-zinc-800">
              <div className={[
                'w-24 h-32 rounded-xl flex items-center justify-center mb-6 shadow-lg',
                EXT_COLORS[selectedPaper.ext] || EXT_COLORS.txt,
              ].join(' ')}>
                <FileType className="w-10 h-10" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50 text-center max-w-md">
                {selectedPaper.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
                {selectedPaper.authors}
              </p>
            </div>
            <div className="px-6 py-4 flex gap-6 text-xs text-slate-500 dark:text-zinc-500">
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Formato:</span> {selectedPaper.ext.toUpperCase()}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Páginas:</span> {selectedPaper.pages}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Estado:</span> Pendiente de Evaluación</div>
            </div>
            {/* Simulated text lines */}
            <div className="px-6 pb-6 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-slate-200 dark:bg-zinc-700"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── RIGHT: Rubric Evaluation Form ── */}
        <Card className="sticky top-24">
          <CardHeader>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              Rúbrica de Evaluación
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
              {/* Criterion 1: Claridad Metodológica */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Claridad Metodológica
                </label>
                <Textarea
                  value={clarity}
                  onChange={(e) => setClarity(e.target.value)}
                  placeholder="Evalúa la claridad de los métodos, diseño experimental, y reproducibilidad..."
                  className="min-h-[90px]"
                  disabled={submitting}
                />
              </div>

              {/* Criterion 2: Originalidad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Originalidad
                </label>
                <Textarea
                  value={originality}
                  onChange={(e) => setOriginality(e.target.value)}
                  placeholder="Evalúa la novedad de la contribución, hipótesis y enfoque..."
                  className="min-h-[90px]"
                  disabled={submitting}
                />
              </div>

              {/* Criterion 3: Estado del Arte */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  Estado del Arte
                </label>
                <Textarea
                  value={stateOfArt}
                  onChange={(e) => setStateOfArt(e.target.value)}
                  placeholder="Evalúa la revisión de literatura, referencias actuales y contexto del campo..."
                  className="min-h-[90px]"
                  disabled={submitting}
                />
              </div>

              {/* Quality Classification */}
              <Select
                label="Calificación de Calidad Propuesta"
                options={QUALITY_OPTIONS}
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={submitting}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                icon={!submitting ? <Send className="w-4 h-4" /> : undefined}
                className="w-full mt-2"
              >
                {submitting ? 'Enviando evaluación...' : 'Enviar Evaluación'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
