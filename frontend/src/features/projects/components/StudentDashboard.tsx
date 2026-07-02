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
        fileUrl: paperFileUrl
      });

      showToast('Paper subido correctamente', 'success');
      // Reset Form
      setPaperTitle('');
      setPaperAbstract('');
      setPaperAuthors('');
      setPaperFileUrl('');
      setShowUploadForm(false);

      // Reload project details
      loadProjectDetails(selectedProjectId);
    } catch (err: any) {
      showToast(err.message || 'Error al subir el paper', 'error');
    } finally {
      setPaperLoading(false);
    }
  };

  /* ── Helper: map paper status to Badge variant ── */
  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="approved">Aprobado</Badge>;
      case 'REJECTED':
        return <Badge variant="rejected">Rechazado</Badge>;
      default:
        return <Badge variant="pending">Pendiente</Badge>;
    }
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* ── Project list (left column) ── */}
      <aside className="w-64 shrink-0 hidden md:block">
        <Card>
          <CardHeader>
            <h3 className="font-display text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Mis Proyectos
            </h3>
          </CardHeader>
          <CardContent className="p-2 flex flex-col gap-1">
            {loadingList ? (
              <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : assignedProjects.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-4 text-center">
                No tienes proyectos asignados actualmente. Contacta al administrador.
              </p>
            ) : (
              assignedProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={[
                    'flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-left text-sm',
                    'transition-colors duration-200',
                    selectedProjectId === proj.id
                      ? 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate">{proj.title}</span>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </aside>

      {/* ── Mobile project selector (visible on small screens) ── */}
      <div className="md:hidden mb-4 w-full">
        {assignedProjects.length > 0 && (
          <select
            value={selectedProjectId ?? ''}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors duration-200
              bg-white border-slate-300 text-slate-900
              dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50"
          >
            {assignedProjects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {selectedProjectId ? (
          loadingDetails ? (
            <div className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <span className="text-sm">Cargando detalles...</span>
            </div>
          ) : projectDetails ? (
            <>
              {/* ── Project Header Card ── */}
              <Card>
                <CardContent>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                    {projectDetails.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {projectDetails.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="font-semibold">Proyecto ID:</span>{' '}
                      <span className="font-mono">{projectDetails.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Estado:</span>
                      <Badge variant={
                        projectDetails.status === 'ACTIVE' ? 'success'
                        : projectDetails.status === 'COMPLETED' ? 'info'
                        : 'default'
                      }>
                        {projectDetails.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Papers Section ── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                    Papers Científicos
                  </h3>
                  <Button
                    variant={showUploadForm ? 'ghost' : 'primary'}
                    size="sm"
                    icon={<PlusCircle className="w-4 h-4" />}
                    onClick={() => setShowUploadForm(!showUploadForm)}
                  >
                    {showUploadForm ? 'Cancelar' : 'Subir Paper'}
                  </Button>
                </div>

                {/* ── Upload Form (slide-up animation) ── */}
                {showUploadForm && (
                  <Card className="mb-6 animate-in slide-in-from-bottom-4 duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                        <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                          Cargar Nuevo Paper Científico
                        </h4>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUploadPaper} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Título del Paper"
                            placeholder="Ej. Optimización de Redes neuronales..."
                            value={paperTitle}
                            onChange={e => setPaperTitle(e.target.value)}
                            disabled={paperLoading}
                          />
                          <Input
                            label="URL del PDF original"
                            type="url"
                            placeholder="https://servidor.org/papers/articulo.pdf"
                            value={paperFileUrl}
                            onChange={e => setPaperFileUrl(e.target.value)}
                            disabled={paperLoading}
                          />
                        </div>
                        <Input
                          label="Autores (separados por comas)"
                          placeholder="Autor Uno, Autor Dos, Profesor Guía"
                          value={paperAuthors}
                          onChange={e => setPaperAuthors(e.target.value)}
                          disabled={paperLoading}
                        />
                        <Textarea
                          label="Resumen (Abstract) - Mínimo 10 caracteres"
                          placeholder="Escribe el resumen ejecutivo de la investigación..."
                          className="min-h-[80px]"
                          value={paperAbstract}
                          onChange={e => setPaperAbstract(e.target.value)}
                          disabled={paperLoading}
                        />
                        <div>
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={paperLoading}
                            icon={<Upload className="w-4 h-4" />}
                          >
                            {paperLoading ? 'Subiendo...' : 'Confirmar Carga'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* ── Papers List ── */}
                {projectDetails.papers.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No hay papers cargados en este proyecto. Haz click en "Subir Paper" para agregar el primero.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-4">
                    {projectDetails.papers.map((paper: any) => (
                      <Card key={paper.id} hoverable>
                        <CardContent>
                          {/* Paper title + actions row */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400 shrink-0" />
                                <span className="truncate">{paper.title}</span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-7">
                                <span className="font-semibold">Autores:</span> {paper.authors.join(', ')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={paper.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md
                                  bg-slate-100 text-slate-700 border border-slate-200
                                  hover:bg-slate-200 transition-colors duration-200
                                  dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                PDF
                              </a>
                              {statusBadge(paper.status)}
                            </div>
                          </div>

                          {/* Abstract */}
                          <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Abstract:</span>{' '}
                              {paper.abstract}
                            </p>
                          </div>

                          {/* Cleaning status & ranking */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">Limpieza:</span>
                                {paper.isCleaned ? (
                                  <Badge variant="success">Completada ✓</Badge>
                                ) : (
                                  <Badge variant="warning">No iniciada</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">Ranking:</span>
                                <span className="font-bold text-accent-600 dark:text-accent-400 text-sm">
                                  {paper.ranking}
                                </span>
                              </div>
                            </div>

                            {paper.isCleaned && paper.cleanDataJson && (
                              <div className="mt-3 rounded-md bg-slate-950/5 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 px-3 py-2 font-mono text-xs text-accent-700 dark:text-accent-400 overflow-x-auto whitespace-pre-wrap">
                                <span className="font-bold">Datos Limpios (JSON):</span> {paper.cleanDataJson}
                              </div>
                            )}
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
              <CardContent className="py-10 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No se pudieron cargar los detalles del proyecto.
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Folder className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecciona un proyecto del menú izquierdo para ver la información.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
