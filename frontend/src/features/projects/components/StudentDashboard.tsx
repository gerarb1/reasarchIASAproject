import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import { Folder, FileText, Upload, PlusCircle, ExternalLink } from 'lucide-react';

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

  return (
    <div className="portal-container">
      {/* Sidebar - Projects list */}
      <aside className="portal-sidebar">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: 'var(--text-muted)', paddingLeft: '1rem', marginBottom: '0.5rem' }}>Mis Proyectos</h3>
        {loadingList ? (
          <div style={{ paddingLeft: '1rem' }}>Cargando...</div>
        ) : assignedProjects.length === 0 ? (
          <div style={{ paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No tienes proyectos asignados actualmente. Contacta al administrador.
          </div>
        ) : (
          assignedProjects.map(proj => (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`sidebar-btn ${selectedProjectId === proj.id ? 'active' : ''}`}
            >
              <Folder className="w-4 h-4" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                {proj.title}
              </span>
            </button>
          ))
        )}
      </aside>

      {/* Main Content */}
      <main className="portal-content">
        {selectedProjectId ? (
          loadingDetails ? (
            <div>Cargando detalles...</div>
          ) : projectDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Project Header */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>{projectDetails.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{projectDetails.description}</p>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Proyecto ID:</span> {projectDetails.id}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>Estado:</span> {projectDetails.status}
                  </div>
                </div>
              </div>

              {/* Papers Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}>Papers Científicos</h3>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="glass-button"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    {showUploadForm ? 'Cancelar' : 'Subir Paper'}
                  </button>
                </div>

                {/* Upload Form (Conditional) */}
                {showUploadForm && (
                  <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload className="w-5 h-5 text-primary" />
                      Cargar Nuevo Paper Científico
                    </h4>
                    <form onSubmit={handleUploadPaper} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Título del Paper</label>
                          <input
                            type="text"
                            className="glass-input"
                            placeholder="Ej. Optimización de Redes neuronales..."
                            value={paperTitle}
                            onChange={e => setPaperTitle(e.target.value)}
                            disabled={paperLoading}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>URL del PDF original</label>
                          <input
                            type="url"
                            className="glass-input"
                            placeholder="https://servidor.org/papers/articulo.pdf"
                            value={paperFileUrl}
                            onChange={e => setPaperFileUrl(e.target.value)}
                            disabled={paperLoading}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Autores (separados por comas)</label>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="Autor Uno, Autor Dos, Profesor Guía"
                          value={paperAuthors}
                          onChange={e => setPaperAuthors(e.target.value)}
                          disabled={paperLoading}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Resumen (Abstract) - Mínimo 10 caracteres</label>
                        <textarea
                          className="glass-input"
                          placeholder="Escribe el resumen ejecutivo de la investigación..."
                          style={{ minHeight: '80px', resize: 'vertical' }}
                          value={paperAbstract}
                          onChange={e => setPaperAbstract(e.target.value)}
                          disabled={paperLoading}
                        />
                      </div>
                      <button type="submit" className="glass-button" style={{ alignSelf: 'flex-start' }} disabled={paperLoading}>
                        {paperLoading ? 'Subiendo...' : 'Confirmar Carga'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Papers List */}
                {projectDetails.papers.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay papers cargados en este proyecto. Haz click en "Subir Paper" para agregar el primero.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projectDetails.papers.map((paper: any) => (
                      <div key={paper.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText className="w-5 h-5 text-secondary" style={{ flexShrink: 0 }} />
                              {paper.title}
                            </h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>Autores:</span> {paper.authors.join(', ')}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <a
                              href={paper.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glass-button secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              PDF
                            </a>
                            <span className={`badge ${paper.status.toLowerCase()}`}>
                              {paper.status === 'PENDING_REVIEW' ? 'Pendiente' : paper.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                          <b>Abstract:</b> {paper.abstract}
                        </p>

                        {/* Cleaning Status info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Limpieza:</span>{' '}
                              {paper.isCleaned ? (
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Completada ✓</span>
                              ) : (
                                <span style={{ color: 'var(--warning)' }}>No iniciada</span>
                              )}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Ranking:</span>{' '}
                              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{paper.ranking}</span>
                            </div>
                          </div>
                          {paper.isCleaned && paper.cleanDataJson && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                              <b>Datos Limpios (JSON):</b> {paper.cleanDataJson}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>No se pudieron cargar los detalles del proyecto.</div>
          )
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Selecciona un proyecto del menú izquierdo para ver la información.
          </div>
        )}
      </main>
    </div>
  );
};
