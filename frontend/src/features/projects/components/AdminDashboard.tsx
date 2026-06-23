import React, { useState, useEffect } from 'react';
import { api, type UserProfile } from '../../../services/api';
import { Folder, Users, UserPlus, FolderPlus } from 'lucide-react';

interface AdminDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'users'>('projects');
  
  // Lists
  const [projects, setProjects] = useState<any[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('STUDENT');

  // Form: Create User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'DATA_CLEANER' | 'STUDENT'>('STUDENT');
  const [userLoading, setUserLoading] = useState(false);

  // Form: Create Project
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [assignedStudentId, setAssignedStudentId] = useState('');
  const [projLoading, setProjLoading] = useState(false);

  const [loadingList, setLoadingList] = useState(false);

  // Fetch initial data
  const loadProjects = async () => {
    setLoadingList(true);
    try {
      const data = await api.listProjects();
      setProjects(data);
    } catch (err: any) {
      showToast('Error al cargar proyectos', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api.listUsers('STUDENT');
      setStudents(data);
      if (data.length > 0) {
        setAssignedStudentId(data[0].id);
      }
    } catch (err: any) {
      showToast('Error al cargar estudiantes para asignación', 'error');
    }
  };

  const loadAllUsers = async (roleFilter?: string) => {
    setLoadingList(true);
    try {
      const data = await api.listUsers(roleFilter || undefined);
      setAllUsers(data);
    } catch (err: any) {
      showToast('Error al cargar lista de usuarios', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
      loadStudents();
    } else {
      loadAllUsers(selectedRoleFilter);
    }
  }, [activeTab, selectedRoleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      showToast('Completa todos los campos para crear el usuario', 'error');
      return;
    }
    setUserLoading(true);
    try {
      await api.register({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      showToast('Usuario creado correctamente', 'success');
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      // Reload lists
      if (activeTab === 'users') {
        loadAllUsers(selectedRoleFilter);
      } else {
        loadStudents();
      }
    } catch (err: any) {
      showToast(err.message || 'Error al crear usuario', 'error');
    } finally {
      setUserLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectDesc || !assignedStudentId) {
      showToast('Completa todos los campos para el proyecto', 'error');
      return;
    }
    setProjLoading(true);
    try {
      await api.createProject(projectTitle, projectDesc, assignedStudentId);
      showToast('Proyecto creado y asignado con éxito', 'success');
      setProjectTitle('');
      setProjectDesc('');
      loadProjects();
    } catch (err: any) {
      showToast(err.message || 'Error al crear proyecto', 'error');
    } finally {
      setProjLoading(false);
    }
  };

  return (
    <div className="portal-container">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <button
          onClick={() => setActiveTab('projects')}
          className={`sidebar-btn ${activeTab === 'projects' ? 'active' : ''}`}
        >
          <Folder className="w-5 h-5" />
          Proyectos
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users className="w-5 h-5" />
          Usuarios / Roles
        </button>
      </aside>

      {/* Main Content */}
      <main className="portal-content">
        {activeTab === 'projects' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Projects List */}
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Proyectos Activos</h3>
              {loadingList ? (
                <div>Cargando proyectos...</div>
              ) : projects.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay proyectos registrados en la plataforma. Crea uno a la derecha.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {projects.map((proj) => {
                    const studentObj = students.find(s => s.id === proj.studentId);
                    return (
                      <div key={proj.id} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>{proj.title}</h4>
                          <span className="badge student" style={{ fontSize: '0.7rem' }}>Asignado</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.75rem 0' }}>{proj.description}</p>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>Estudiante:</span> {studentObj ? studentObj.name : proj.studentId}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600 }}>Creado por Admin ID:</span> {proj.ownerId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Project Form */}
            <div>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FolderPlus className="w-5 h-5 text-primary" />
                  Nuevo Proyecto
                </h3>
                <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Título</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Título del proyecto"
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      disabled={projLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Descripción</label>
                    <textarea
                      className="glass-input"
                      placeholder="Descripción científica..."
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      value={projectDesc}
                      onChange={e => setProjectDesc(e.target.value)}
                      disabled={projLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Asignar Estudiante</label>
                    {students.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--error)' }}>
                        No hay estudiantes registrados. Registra uno primero en la sección de Usuarios.
                      </div>
                    ) : (
                      <select
                        className="glass-input"
                        value={assignedStudentId}
                        onChange={e => setAssignedStudentId(e.target.value)}
                        disabled={projLoading}
                      >
                        {students.map(student => (
                          <option key={student.id} value={student.id} style={{ background: '#0b0f19' }}>
                            {student.name} ({student.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button type="submit" className="glass-button" style={{ marginTop: '0.5rem' }} disabled={projLoading || students.length === 0}>
                    {projLoading ? 'Creando...' : 'Crear y Asignar'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Users List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>Lista de Usuarios</h3>
                <div>
                  <select
                    className="glass-input"
                    value={selectedRoleFilter}
                    onChange={e => setSelectedRoleFilter(e.target.value)}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  >
                    <option value="STUDENT" style={{ background: '#0b0f19' }}>Filtrar: Estudiantes</option>
                    <option value="DATA_CLEANER" style={{ background: '#0b0f19' }}>Filtrar: Revisores</option>
                    <option value="ADMIN" style={{ background: '#0b0f19' }}>Filtrar: Administradores</option>
                    <option value="" style={{ background: '#0b0f19' }}>Mostrar Todos</option>
                  </select>
                </div>
              </div>

              {loadingList ? (
                <div>Cargando lista de usuarios...</div>
              ) : allUsers.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron usuarios para el rol seleccionado.
                </div>
              ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Nombre</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Rol</th>
                        <th style={{ padding: '1rem' }}>Fecha Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#fff' }}>{user.name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${user.role.toLowerCase()}`}>{user.role}</span>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Create User Form */}
            <div>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus className="w-5 h-5 text-primary" />
                  Nuevo Usuario
                </h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Nombre Completo</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Nombre del usuario"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      disabled={userLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Correo Electrónico</label>
                    <input
                      type="email"
                      className="glass-input"
                      placeholder="nombre@ejemplo.com"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      disabled={userLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Contraseña</label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="••••••••"
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      disabled={userLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Rol asignado</label>
                    <select
                      className="glass-input"
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value as any)}
                      disabled={userLoading}
                    >
                      <option value="STUDENT" style={{ background: '#0b0f19' }}>Estudiante / Investigador</option>
                      <option value="DATA_CLEANER" style={{ background: '#0b0f19' }}>Data Cleaner / Revisor</option>
                      <option value="ADMIN" style={{ background: '#0b0f19' }}>Administrador</option>
                    </select>
                  </div>
                  <button type="submit" className="glass-button" style={{ marginTop: '0.5rem' }} disabled={userLoading}>
                    {userLoading ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
