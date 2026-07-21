import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import { Folder, FileText, Upload, PlusCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

interface StudentDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ showToast }) => {
  const { user } = useAuth();

  // Lists
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);

  // Form: Upload Paper
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperFileUrl, setPaperFileUrl] = useState('');
  const [paperLoading, setPaperLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadProjects = async () => {
    setLoadingList(true);
    try {
      const data = await api.listProjects();
      // Filter projects where this student is assigned
      const filtered = data.filter((p: any) => p.studentId === user?.id);
      setAssignedProjects(filtered);
      if (filtered.length > 0 && !selectedProjectId) {
        setSelectedProjectId(filtered[0].id);
      }
    } catch (err: any) {
      showToast('Error al cargar tus proyectos', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const loadProjectDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const data = await api.getProjectDetails(id);
      setProjectDetails(data);
    } catch (err: any) {
      showToast('Error al cargar detalles del proyecto', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
      setShowUploadForm(false);
    }
  }, [selectedProjectId]);

  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle || !paperAbstract || !paperAuthors || !paperFileUrl) {
      showToast('Completa todos los campos del paper', 'error');
      return;
    }
    if (!selectedProjectId) return;

    setPaperLoading(true);
    try {
      const authorsArray = paperAuthors.split(',').map(a => a.trim()).filter(a => a.length > 0);

      await api.addPaper(selectedProjectId, {
        title: paperTitle,
        abstract: paperAbstract,
        authors: authorsArray,
        fileUrl: paperFileUrl,
      });

      showToast('Paper subido correctamente', 'success');
      setPaperTitle('');
      setPaperAbstract('');
      setPaperAuthors('');
      setPaperFileUrl('');
      setShowUploadForm(false);

      loadProjectDetails(selectedProjectId);
    } catch (err: any) {
      showToast(err.message || 'Error al subir el paper', 'error');
    } finally {
      setPaperLoading(false);
    }
  };

  // ── Loading state ──
  const renderLoading = (text: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-accent-500" />
      <p className="text-sm">{text}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* ── Project List (Left Column) ── */}
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
          Proyectos Asignados
        </h3>

        {loadingList ? (
          <div className="py-8 text-center text-sm text-slate-500">Cargando...</div>
        ) : assignedProjects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Folder className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No tienes proyectos asignados. Contacta al administrador.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {assignedProjects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer',
                  selectedProjectId === proj.id
                    ? 'bg-accent-50 border border-accent-200 text-accent-800 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                <Folder className={[
                  'w-4 h-4 shrink-0',
                  selectedProjectId === proj.id ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400',
                ].join(' ')} />
                <span className="text-sm font-medium truncate">{proj.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content (Right) ── */}
      <div className="flex flex-col gap-6">
        {selectedProjectId ? (
          loadingDetails ? (
            renderLoading('Cargando detalles...')
          ) : projectDetails ? (
            <>
              {/* Project Header */}
              <Card>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                        {projectDetails.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {projectDetails.description}
                      </p>
                    </div>
                    <Button
                      variant={showUploadForm ? 'secondary' : 'primary'}
                      size="sm"
                      icon={showUploadForm ? undefined : <PlusCircle className="w-4 h-4" />}
                      onClick={() => setShowUploadForm(!showUploadForm)}
                    >
                      {showUploadForm ? 'Cancelar' : 'Subir Paper'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Form */}
              {showUploadForm && (
                <Card className="animate-slide-up">
                  <CardHeader>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                      Nuevo Paper
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUploadPaper} className="flex flex-col gap-4">
                      <Input
                        label="Título del Paper"
                        type="text"
                        placeholder="Título de la publicación"
                        value={paperTitle}
                        onChange={(e) => setPaperTitle(e.target.value)}
                        disabled={paperLoading}
                      />
                      <Textarea
                        label="Abstract"
                        placeholder="Resumen del paper..."
                        className="min-h-[100px]"
                        value={paperAbstract}
                        onChange={(e) => setPaperAbstract(e.target.value)}
                        disabled={paperLoading}
                      />
                      <Input
                        label="Autores (separados por coma)"
                        type="text"
                        placeholder="Autor 1, Autor 2, Autor 3"
                        value={paperAuthors}
                        onChange={(e) => setPaperAuthors(e.target.value)}
                        disabled={paperLoading}
                      />
                      <Input
                        label="URL del PDF"
                        type="url"
                        placeholder="https://ejemplo.com/paper.pdf"
                        value={paperFileUrl}
                        onChange={(e) => setPaperFileUrl(e.target.value)}
                        disabled={paperLoading}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={paperLoading}
                        icon={!paperLoading ? <Upload className="w-4 h-4" /> : undefined}
                      >
                        {paperLoading ? 'Subiendo...' : 'Subir Paper'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Papers List */}
              <div>
                <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-3">
                  Papers del Proyecto
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
                  <div className="flex flex-col gap-3">
                    {projectDetails.papers.map((paper: any) => (
                      <Card key={paper.id} hoverable>
                        <CardContent>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-accent-600 dark:text-accent-400 shrink-0" />
                                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                                  {paper.title}
                                </h5>
                              </div>
                              {paper.authors && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
                                  {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant={
                                  paper.status === 'APPROVED'
                                    ? 'approved'
                                    : paper.status === 'REJECTED'
                                    ? 'rejected'
                                    : 'pending'
                                }
                              >
                                {paper.status === 'PENDING_REVIEW'
                                  ? 'Pendiente'
                                  : paper.status === 'APPROVED'
                                  ? 'Aprobado'
                                  : 'Rechazado'}
                              </Badge>
                              {paper.fileUrl && (
                                <a
                                  href={paper.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
                                  title="Ver PDF"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
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
                              <span className="text-accent-600 dark:text-accent-400 font-medium">
                                {paper.ranking}
                              </span>
                            </div>
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
              <CardContent className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Error al cargar la información del proyecto.
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-lg font-display font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selecciona un proyecto
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center">
                Elige un proyecto del panel izquierdo para ver sus papers y subir nuevas publicaciones.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
