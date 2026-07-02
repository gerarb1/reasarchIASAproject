import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Folder, FileText, CheckCircle, Database, Lock, ExternalLink, Loader2 } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Input, Textarea } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';

interface CleanerDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'approved' as const;
    case 'REJECTED':
      return 'rejected' as const;
    default:
      return 'pending' as const;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Aprobado';
    case 'REJECTED':
      return 'Rechazado';
    default:
      return 'Pendiente';
  }
};

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
      // Reset selected paper when switching project
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
        // Enviar título y fileUrl originales para validar inmutabilidad en backend
        title: selectedPaper.title,
        fileUrl: selectedPaper.fileUrl
      });

      showToast('Limpieza y revisión guardadas correctamente', 'success');
      setSelectedPaper(null);
      // Reload project details
      if (selectedProjectId) {
        loadProjectDetails(selectedProjectId);
      }
    } catch (err: any) {
      showToast(err.message || 'Error al guardar revisión', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Project Selector ── */}
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
            Bandeja Científica
          </h2>
        </CardHeader>
        <CardContent className="p-3">
          {loadingList ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando proyectos…
            </div>
          ) : projects.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No hay proyectos registrados en el sistema.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {projects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={[
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium',
                    'transition-colors duration-200 cursor-pointer',
                    'border',
                    selectedProjectId === proj.id
                      ? 'bg-accent-50 text-accent-700 border-accent-300 dark:bg-accent-950/50 dark:text-accent-400 dark:border-accent-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700',
                  ].join(' ')}
                >
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[200px]">{proj.title}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Main Grid: Papers List + Review Panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Left: Selected Project Details & Papers List ── */}
        <div className="space-y-5">
          {selectedProjectId ? (
            loadingDetails ? (
              <Card>
                <CardContent>
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando detalles…
                  </div>
                </CardContent>
              </Card>
            ) : projectDetails ? (
              <>
                {/* Project Info Card */}
                <Card>
                  <CardContent>
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                      {projectDetails.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {projectDetails.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Papers List */}
                <div className="space-y-3">
                  <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                    Papers para Revisar
                  </h4>

                  {projectDetails.papers.length === 0 ? (
                    <Card>
                      <CardContent>
                        <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                          No hay papers subidos en este proyecto.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {projectDetails.papers.map((paper: any) => (
                        <Card
                          key={paper.id}
                          hoverable
                          onClick={() => handleSelectPaper(paper)}
                          className={[
                            'border-l-4 transition-all duration-200',
                            selectedPaper?.id === paper.id
                              ? 'border-l-accent-500 dark:border-l-accent-400 ring-1 ring-accent-200 dark:ring-accent-800'
                              : 'border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-600',
                          ].join(' ')}
                        >
                          <CardContent className="px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                                <FileText className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
                                {paper.title}
                              </h5>
                              <Badge variant={statusBadgeVariant(paper.status)}>
                                {statusLabel(paper.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                              <span>
                                Limpieza:{' '}
                                {paper.isCleaned ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Si ✓</span>
                                ) : (
                                  'No'
                                )}
                              </span>
                              <span>
                                Ranking:{' '}
                                <span className="text-accent-600 dark:text-accent-400 font-medium">{paper.ranking}</span>
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent>
                  <p className="py-4 text-center text-sm text-red-500 dark:text-red-400">
                    Error al cargar información.
                  </p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent>
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Selecciona un proyecto del panel superior.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Selected Paper Review Panel ── */}
        <div>
          {selectedPaper ? (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  Limpieza y Metadatos de Publicación
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-5">

                  {/* Original Title (Read-only) */}
                  <Input
                    label="Título Original (Inmutable)"
                    icon={<Lock className="w-3.5 h-3.5" />}
                    value={selectedPaper.title}
                    disabled
                  />

                  {/* Original File URL (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-400 dark:text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                        Enlace PDF Original (Inmutable)
                      </label>
                      <a
                        href={selectedPaper.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:underline transition-colors duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver PDF
                      </a>
                    </div>
                    <Input
                      value={selectedPaper.fileUrl}
                      disabled
                    />
                  </div>

                  {/* Status + Ranking Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Estado de Aprobación"
                      value={reviewStatus}
                      onChange={e => setReviewStatus(e.target.value as any)}
                      disabled={submitLoading}
                      options={statusOptions}
                    />
                    <Select
                      label="Ranking (SJR)"
                      value={ranking}
                      onChange={e => setRanking(e.target.value as any)}
                      disabled={submitLoading}
                      options={rankingOptions}
                    />
                  </div>

                  {/* isCleaned Toggle */}
                  <label
                    htmlFor="isCleanedCheckbox"
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer',
                      'transition-colors duration-200',
                      isCleaned
                        ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700',
                      submitLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-600',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      id="isCleanedCheckbox"
                      checked={isCleaned}
                      onChange={e => setIsCleaned(e.target.checked)}
                      disabled={submitLoading}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Marcar datos científicos como limpios y verificados
                    </span>
                    {isCleaned && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 ml-auto shrink-0" />
                    )}
                  </label>

                  {/* cleanDataJson Textarea */}
                  <Textarea
                    label="Datos Limpios (Formato JSON)"
                    value={cleanDataJson}
                    onChange={e => setCleanDataJson(e.target.value)}
                    disabled={submitLoading}
                    className="min-h-[120px] font-mono text-xs"
                    placeholder='{ "accuracy": 98.2 }'
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={submitLoading}
                      icon={<CheckCircle className="w-4 h-4" />}
                      className="flex-1"
                    >
                      {submitLoading ? 'Guardando…' : 'Aprobar y Guardar'}
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
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-4" />
                  <h4 className="font-display text-base font-semibold text-slate-700 dark:text-slate-300">
                    Ningún paper seleccionado
                  </h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Haz click en un paper de la lista para abrir el panel de revisión de metadatos.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
