import React, { useState, useEffect } from 'react';
import { api, type UserProfile } from '../../../services/api';
import { Folder, FolderPlus, UserPlus, Users, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';

interface AdminDashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  activeSection?: string;
}

const roleBadgeVariant: Record<string, 'admin' | 'cleaner' | 'student'> = {
  ADMIN: 'admin',
  DATA_CLEANER: 'cleaner',
  STUDENT: 'student',
};

const roleFilterOptions = [
  { value: 'STUDENT', label: 'Filtrar: Estudiantes' },
  { value: 'DATA_CLEANER', label: 'Filtrar: Revisores' },
  { value: 'ADMIN', label: 'Filtrar: Administradores' },
  { value: '', label: 'Mostrar Todos' },
];

const roleOptions = [
  { value: 'STUDENT', label: 'Estudiante / Investigador' },
  { value: 'DATA_CLEANER', label: 'Data Cleaner / Revisor' },
  { value: 'ADMIN', label: 'Administrador' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  showToast,
  activeSection = 'projects',
}) => {
  const currentSection = activeSection === 'users' ? 'users' : 'projects';

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

  // ── Data fetching ──
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
    if (currentSection === 'projects') {
      loadProjects();
      loadStudents();
    } else {
      loadAllUsers(selectedRoleFilter);
    }
  }, [currentSection, selectedRoleFilter]);

  // ── Handlers ──
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
        role: newUserRole,
      });
      showToast('Usuario creado correctamente', 'success');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      if (currentSection === 'users') {
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

  // ── Loading spinner ──
  const renderLoading = (text: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-accent-500" />
      <p className="text-sm">{text}</p>
    </div>
  );

  // ── Student select options (for project form) ──
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.email})`,
  }));

  // ══════════════════════════════════════════════════════════════
  //  PROJECTS VIEW
  // ══════════════════════════════════════════════════════════════
  if (currentSection === 'projects') {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        {/* ── Projects list ── */}
        <div>
          <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">
            Proyectos Activos
          </h3>

          {loadingList ? (
            renderLoading('Cargando proyectos…')
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Folder className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  No hay proyectos registrados en la plataforma. Crea uno a la derecha.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {projects.map((proj) => {
                const studentObj = students.find((s) => s.id === proj.studentId);
                return (
                  <Card key={proj.id} hoverable>
                    <CardContent>
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {proj.title}
                        </h4>
                        <Badge variant="student">Asignado</Badge>
                      </div>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 mb-4 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="flex gap-6 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Estudiante:
                          </span>{' '}
                          {studentObj ? studentObj.name : proj.studentId}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Creado por Admin ID:
                          </span>{' '}
                          {proj.ownerId.substring(0, 8)}…
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Create project form ── */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                Nuevo Proyecto
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
                <Input
                  label="Título"
                  type="text"
                  placeholder="Título del proyecto"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  disabled={projLoading}
                />

                <Textarea
                  label="Descripción"
                  placeholder="Descripción científica…"
                  className="min-h-[80px]"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  disabled={projLoading}
                />

                <div>
                  {students.length === 0 ? (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      No hay estudiantes registrados. Registra uno primero en la sección de Usuarios.
                    </p>
                  ) : (
                    <Select
                      label="Asignar Estudiante"
                      options={studentOptions}
                      value={assignedStudentId}
                      onChange={(e) => setAssignedStudentId(e.target.value)}
                      disabled={projLoading}
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={projLoading}
                  disabled={projLoading || students.length === 0}
                  className="mt-1"
                >
                  {projLoading ? 'Creando…' : 'Crear y Asignar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  USERS VIEW
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
      {/* ── Users table ── */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Lista de Usuarios
          </h3>
          <Select
            options={roleFilterOptions}
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-auto min-w-[200px]"
          />
        </div>

        {loadingList ? (
          renderLoading('Cargando lista de usuarios…')
        ) : allUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                No se encontraron usuarios para el rol seleccionado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Nombre
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Rol
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Fecha Registro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleBadgeVariant[user.role] || 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ── Create user form ── */}
      <div>
        <Card>
          <CardHeader>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              Nuevo Usuario
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <Input
                label="Nombre Completo"
                type="text"
                placeholder="Nombre del usuario"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                disabled={userLoading}
              />

              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                disabled={userLoading}
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                disabled={userLoading}
              />

              <Select
                label="Rol asignado"
                options={roleOptions}
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                disabled={userLoading}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={userLoading}
                disabled={userLoading}
                className="mt-1"
              >
                {userLoading ? 'Creando…' : 'Crear Usuario'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
