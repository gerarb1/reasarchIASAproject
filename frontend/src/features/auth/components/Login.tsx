import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, FlaskConical } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

interface LoginProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const Login: React.FC<LoginProps> = ({ showToast }) => {
  const { login, registerUser } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'DATA_CLEANER' | 'STUDENT'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      showToast('Sesión iniciada correctamente', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
      showToast('Fallo al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await registerUser({ name, email, password, role });
      showToast('Usuario registrado con éxito', 'success');
      // Auto login
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrarse. Inténtalo de nuevo.');
      showToast('Fallo al registrar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-500/10 dark:bg-accent-400/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-500/10 dark:bg-accent-400/5 blur-3xl" />
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevated overflow-hidden">
          {/* Brand Header */}
          <div className="text-center pt-8 pb-6 px-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-600 dark:bg-accent-500 mb-4 shadow-lg shadow-accent-500/20">
              <FlaskConical className="w-7 h-7 text-white dark:text-slate-950" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              ResearchCore
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Plataforma de Investigación Científica
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mx-8">
            <button
              onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer',
                isLoginTab
                  ? 'border-accent-600 text-accent-700 dark:border-accent-400 dark:text-accent-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
              ].join(' ')}
            >
              <LogIn className="w-4 h-4" />
              Acceder
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer',
                !isLoginTab
                  ? 'border-accent-600 text-accent-700 dark:border-accent-400 dark:text-accent-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
              ].join(' ')}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          {/* Form Area */}
          <div className="px-8 py-6">
            {/* Error Alert */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-3.5 mb-5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-slide-up">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="whitespace-pre-wrap">{errorMsg}</div>
              </div>
            )}

            {isLoginTab ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  icon={!loading ? <LogIn className="w-4 h-4" /> : undefined}
                  className="w-full mt-2"
                >
                  {loading ? 'Iniciando sesión...' : 'Entrar'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Input
                  label="Nombre Completo"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Select
                  label="Rol en la Plataforma"
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  disabled={loading}
                  options={[
                    { value: 'STUDENT', label: 'Estudiante / Investigador' },
                    { value: 'DATA_CLEANER', label: 'Data Cleaner / Revisor' },
                    { value: 'ADMIN', label: 'Administrador' },
                  ]}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  icon={!loading ? <UserPlus className="w-4 h-4" /> : undefined}
                  className="w-full mt-2"
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          © {new Date().getFullYear()} ResearchCore · IASAS
        </p>
      </div>
    </div>
  );
};
