import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, FlaskConical } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface LoginProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

/** Google "G" SVG icon */
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const Login: React.FC<LoginProps> = ({ showToast }) => {
  const { login, registerUser } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
    if (!name || !email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      // Role hidden from UI — always STUDENT (backend schema requires it)
      await registerUser({ name, email, password, role: 'STUDENT' });
      showToast('Usuario registrado con éxito', 'success');
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrarse. Inténtalo de nuevo.');
      showToast('Fallo al registrar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-500/10 dark:bg-accent-400/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-500/10 dark:bg-accent-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-elevated overflow-hidden">
          {/* Brand Header */}
          <div className="text-center pt-8 pb-6 px-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-600 dark:bg-accent-500 mb-4 shadow-lg shadow-accent-500/20">
              <FlaskConical className="w-7 h-7 text-white dark:text-zinc-950" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              ResearchCore
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Plataforma de Investigación Científica
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800 mx-8">
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
            {errorMsg && (
              <div className="flex items-start gap-3 p-3.5 mb-5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-slide-up">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="whitespace-pre-wrap">{errorMsg}</div>
              </div>
            )}

            {isLoginTab ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input label="Correo Electrónico" type="email" placeholder="nombre@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={!loading ? <LogIn className="w-4 h-4" /> : undefined} className="w-full mt-2">
                  {loading ? 'Iniciando sesión...' : 'Entrar'}
                </Button>

                {/* Divider */}
                <div className="relative flex items-center my-1">
                  <div className="flex-1 border-t border-slate-200 dark:border-zinc-700" />
                  <span className="px-3 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">o</span>
                  <div className="flex-1 border-t border-slate-200 dark:border-zinc-700" />
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className={[
                    'w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg',
                    'text-sm font-semibold transition-all duration-200 cursor-pointer',
                    'bg-white border border-slate-300 text-slate-700',
                    'hover:bg-slate-50 hover:shadow-md hover:border-slate-400',
                    'dark:bg-zinc-800 dark:border-zinc-600 dark:text-slate-200',
                    'dark:hover:bg-zinc-700 dark:hover:border-zinc-500',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  ].join(' ')}
                >
                  <GoogleIcon />
                  Continuar con Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Input label="Nombre Completo" type="text" placeholder="Tu nombre completo" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
                <Input label="Correo Electrónico" type="email" placeholder="nombre@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                <Input label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={!loading ? <UserPlus className="w-4 h-4" /> : undefined} className="w-full mt-2">
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-zinc-600 mt-6">
          © {new Date().getFullYear()} ResearchCore · IASAS
        </p>
      </div>
    </div>
  );
};
