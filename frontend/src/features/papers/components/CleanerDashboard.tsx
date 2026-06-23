import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Folder, FileText, CheckCircle, Database, Lock, ExternalLink } from 'lucide-react';

interface CleanerDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

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
    <div className="portal-container">
      {/* Sidebar - Projects */}
      <aside className="portal-sidebar">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: 'var(--text-muted)', paddingLeft: '1rem', marginBottom: '0.5rem' }}>Bandeja Científica</h3>
        {loadingList ? (
          <div style={{ paddingLeft: '1rem' }}>Cargando...</div>
        ) : projects.length === 0 ? (
          <div style={{ paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No hay proyectos registrados en el sistema.
          </div>
        ) : (
          projects.map(proj => (
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
      <main className="portal-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left: Selected Project details & Papers list */}
        <div>
          {selectedProjectId ? (
            loadingDetails ? (
              <div>Cargando detalles...</div>
            ) : projectDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff' }}>{projectDetails.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{projectDetails.description}</p>
                </div>

                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem' }}>Papers para Revisar</h4>
                {projectDetails.papers.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay papers subidos en este proyecto.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projectDetails.papers.map((paper: any) => (
                      <div
                        key={paper.id}
                        onClick={() => handleSelectPaper(paper)}
                        className={`glass-panel glass-panel-hover ${selectedPaper?.id === paper.id ? 'active' : ''}`}
                        style={{ padding: '1.25rem', cursor: 'pointer', borderLeft: selectedPaper?.id === paper.id ? '3px solid var(--warning)' : '1px solid var(--border-color)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h5 style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FileText className="w-4 h-4 text-warning" />
                            {paper.title}
                          </h5>
                          <span className={`badge ${paper.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                            {paper.status === 'PENDING_REVIEW' ? 'Pendiente' : paper.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <div>
                            Limpieza: {paper.isCleaned ? <span style={{ color: 'var(--success)' }}>Si ✓</span> : 'No'}
                          </div>
                          <div>
                            Ranking: <span style={{ color: 'var(--primary)' }}>{paper.ranking}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>Error al cargar información.</div>
            )
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Selecciona un proyecto del menú izquierdo.
            </div>
          )}
        </div>

        {/* Right: Selected Paper review panel */}
        <div>
          {selectedPaper ? (
            <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database className="w-5 h-5 text-warning" />
                Limpieza y Metadatos de Publicación
              </h3>
              
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* original Title (Disabled/Read-only to enforce immutability) */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <Lock className="w-3.5 h-3.5" />
                    Título Original (Inmutable)
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    value={selectedPaper.title}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>

                {/* original File URL (Disabled/Read-only to enforce immutability) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Lock className="w-3.5 h-3.5" />
                      Enlace PDF Original (Inmutable)
                    </label>
                    <a href={selectedPaper.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      <ExternalLink className="w-3.5 h-3.5" /> Ver PDF
                    </a>
                  </div>
                  <input
                    type="text"
                    className="glass-input"
                    value={selectedPaper.fileUrl}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Status Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Estado de Aprobación</label>
                    <select
                      className="glass-input"
                      value={reviewStatus}
                      onChange={e => setReviewStatus(e.target.value as any)}
                      disabled={submitLoading}
                    >
                      <option value="PENDING_REVIEW" style={{ background: '#0b0f19' }}>Pendiente</option>
                      <option value="APPROVED" style={{ background: '#0b0f19' }}>Aprobado</option>
                      <option value="REJECTED" style={{ background: '#0b0f19' }}>Rechazado</option>
                    </select>
                  </div>

                  {/* Ranking Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Ranking (SJR)</label>
                    <select
                      className="glass-input"
                      value={ranking}
                      onChange={e => setRanking(e.target.value as any)}
                      disabled={submitLoading}
                    >
                      <option value="Q1" style={{ background: '#0b0f19' }}>Q1 (Excelente)</option>
                      <option value="Q2" style={{ background: '#0b0f19' }}>Q2 (Alto)</option>
                      <option value="Q3" style={{ background: '#0b0f19' }}>Q3 (Medio)</option>
                      <option value="Q4" style={{ background: '#0b0f19' }}>Q4 (Bajo)</option>
                      <option value="UNRANKED" style={{ background: '#0b0f19' }}>UNRANKED (Sin Categorizar)</option>
                    </select>
                  </div>
                </div>

                {/* isCleaned Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="checkbox"
                    id="isCleanedCheckbox"
                    checked={isCleaned}
                    onChange={e => setIsCleaned(e.target.checked)}
                    disabled={submitLoading}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isCleanedCheckbox" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                    Marcar datos científicos como limpios y verificados
                  </label>
                </div>

                {/* cleanDataJson Textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Datos Limpios (Formato JSON)</label>
                  <textarea
                    className="glass-input"
                    value={cleanDataJson}
                    onChange={e => setCleanDataJson(e.target.value)}
                    disabled={submitLoading}
                    style={{ minHeight: '120px', fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
                    placeholder='{ "accuracy": 98.2 }'
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="glass-button" style={{ flex: 1 }} disabled={submitLoading}>
                    {submitLoading ? 'Guardando...' : 'Aprobar y Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaper(null)}
                    className="glass-button secondary"
                    disabled={submitLoading}
                  >
                    Cancelar
                  </button>
                </div>

              </form>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <CheckCircle className="w-10 h-10 text-muted" style={{ marginBottom: '1rem' }} />
              <h4>Ningún paper seleccionado</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', maxWidth: '300px' }}>Haz click en un paper de la lista de la izquierda para abrir el panel de revisión de metadatos.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
