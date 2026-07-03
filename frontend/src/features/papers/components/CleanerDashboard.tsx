import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  Folder,
  FileText,
  CheckCircle,
  Database,
  Lock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';

interface CleanerDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const statusOptions = [
  { value: 'PENDING_REVIEW', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
];

const rankingOptions = [
  { value: 'Q1', label: 'Q1 (Excelente)' },
  { value: 'Q2', label: 'Q2 (Alto)' },
  { value: 'Q3', label: 'Q3 (Medio)' },
  { value: 'Q4', label: 'Q4 (Bajo)' },
  { value: 'UNRANKED', label: 'UNRANKED (Sin Categorizar)' },
];

export const CleanerDashboard: React.FC<CleanerDashboardProps> = ({ showToast }) => {
  // Lists
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);

  // Review states
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [isCleaned, setIsCleaned] = useState(false);
  const [cleanDataJson, setCleanDataJson] = useState('');
  const [ranking, setRanking] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'UNRANKED'>('UNRANKED');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadProjects = async () => {
    setLoadingList(true);
    try {
      const data = await api.listProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err: any) {
      showToast('Error al cargar proyectos', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const loadProjectDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const data = await api.getProjectDetails(id);
      setProjectDetails(data);
      setSelectedPaper(null);
    } catch (err: any) {
      showToast('Error al cargar detalles del proyecto', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Load paper into review form
  const handleSelectPaper = (paper: any) => {
    setSelectedPaper(paper);
    setReviewStatus(paper.status);
    setIsCleaned(paper.isCleaned);
    setCleanDataJson(paper.cleanDataJson || '{\n  "accuracy": 0.0\n}');
    setRanking(paper.ranking);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;

    // Validate JSON format
    if (cleanDataJson) {
      try {
        JSON.parse(cleanDataJson);
      } catch (err) {
        showToast('El campo cleanDataJson debe ser un JSON válido', 'error');
        return;
      }
    }

    setSubmitLoading(true);
    try {
      await api.reviewPaper(selectedPaper.id, {
        status: reviewStatus,
        isCleaned,
        cleanDataJson: cleanDataJson || null,
        ranking,
        title: selectedPaper.title,
        fileUrl: selectedPaper.fileUrl,
      });

      showToast('Limpieza y revisión guardadas correctamente', 'success');
      setSelectedPaper(null);
      if (selectedProjectId) {
        loadProjectDetails(selectedProjectId);
      }
    } catch (err: any) {
      showToast(err.message || 'Error al guardar revisión', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Loading spinner ──
  const renderLoading = (text: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-accent-500" />
      <p className="text-sm">{text}</p>
    </div>
  );

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    return 'pending';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'APPROVED') return 'Aprobado';
    if (status === 'REJECTED') return 'Rechazado';
    return 'Pendiente';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Project Selector (Top Bar) ── */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
          Proyecto:
        </h3>
        {loadingList ? (
          <span className="text-sm text-slate-500">Cargando...</span>
        ) : projects.length === 0 ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            No hay proyectos registrados en el sistema.
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={[
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                  selectedProjectId === proj.id
                    ? 'bg-accent-50 text-accent-800 border border-accent-200 dark:bg-accent-950/40 dark:text-accent-300 dark:border-accent-800'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                <Folder className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{proj.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      {selectedProjectId ? (
        loadingDetails ? (
          renderLoading('Cargando detalles...')
        ) : projectDetails ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* ── Left: Project details + Papers list ── */}
            <div className="flex flex-col gap-4">
              {/* Project Info */}
              <Card>
                <CardContent>
                  <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {projectDetails.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {projectDetails.description}
                  </p>
                </CardContent>
              </Card>

              {/* Papers */}
              <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                Papers para Revisar
              </h4>

              {projectDetails.papers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No hay papers subidos en este proyecto.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-2">
                  {projectDetails.papers.map((paper: any) => (
                    <button
                      key={paper.id}
                      onClick={() => handleSelectPaper(paper)}
                      className={[
                        'w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer',
                        selectedPaper?.id === paper.id
                          ? 'border-l-4 border-l-amber-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 bg-amber-50/50 dark:border-l-amber-400 dark:border-t-slate-700 dark:border-r-slate-700 dark:border-b-slate-700 dark:bg-amber-950/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:border-slate-700',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                            {paper.title}
                          </span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(paper.status)} className="text-[0.6rem] shrink-0">
                          {getStatusLabel(paper.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          Limpieza:{' '}
                          {paper.isCleaned ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sí ✓</span>
                          ) : (
                            'No'
                          )}
                        </div>
                        <div>
                          Ranking:{' '}
                          <span className="text-accent-600 dark:text-accent-400 font-medium">{paper.ranking}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Review Panel ── */}
            <div>
              {selectedPaper ? (
                <Card className="animate-fade-in sticky top-24">
                  <CardHeader>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      Limpieza y Metadatos
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                      {/* Immutable Title */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          Título Original (Inmutable)
                        </label>
                        <input
                          type="text"
                          value={selectedPaper.title}
                          disabled
                          className="w-full rounded-lg border px-3.5 py-2.5 text-sm bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      {/* Immutable File URL */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            Enlace PDF (Inmutable)
                          </label>
                          <a
                            href={selectedPaper.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver PDF
                          </a>
                        </div>
                        <input
                          type="text"
                          value={selectedPaper.fileUrl}
                          disabled
                          className="w-full rounded-lg border px-3.5 py-2.5 text-sm bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/30 dark:border-slate-700 dark:text-slate-500 cursor-not-allowed truncate"
                        />
                      </div>

                      {/* Status + Ranking row */}
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          label="Estado de Aprobación"
                          options={statusOptions}
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(e.target.value as any)}
                          disabled={submitLoading}
                        />
                        <Select
                          label="Ranking (SJR)"
                          options={rankingOptions}
                          value={ranking}
                          onChange={(e) => setRanking(e.target.value as any)}
                          disabled={submitLoading}
                        />
                      </div>

                      {/* isCleaned Toggle */}
                      <label
                        htmlFor="isCleanedCheckbox"
                        className={[
                          'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200',
                          isCleaned
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                            : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/30 dark:border-slate-700 dark:hover:bg-slate-800/50',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          id="isCleanedCheckbox"
                          checked={isCleaned}
                          onChange={(e) => setIsCleaned(e.target.checked)}
                          disabled={submitLoading}
                          className="w-4 h-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600 cursor-pointer"
                        />
                        <span className={[
                          'text-sm font-medium',
                          isCleaned
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300',
                        ].join(' ')}>
                          Datos científicos limpios y verificados
                        </span>
                      </label>

                      {/* Clean Data JSON */}
                      <Textarea
                        label="Datos Limpios (Formato JSON)"
                        value={cleanDataJson}
                        onChange={(e) => setCleanDataJson(e.target.value)}
                        disabled={submitLoading}
                        className="min-h-[120px] font-mono text-xs"
                        placeholder='{ "accuracy": 98.2 }'
                      />

                      {/* Actions */}
                      <div className="flex gap-3 mt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={submitLoading}
                          className="flex-1"
                        >
                          {submitLoading ? 'Guardando...' : 'Aprobar y Guardar'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedPaper(null)}
                          disabled={submitLoading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <CheckCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h4 className="font-display text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ningún paper seleccionado
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center">
                      Haz click en un paper de la lista de la izquierda para abrir el panel de revisión.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Error al cargar información del proyecto.
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="font-display text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Selecciona un proyecto
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Elige un proyecto de la barra superior para revisar sus papers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
