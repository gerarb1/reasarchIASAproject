import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

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
    <div className="auth-page">
      <div className="glass-panel auth-card">
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
          ResearchCore
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`sidebar-btn ${isLoginTab ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', borderRadius: '8px 8px 0 0', borderLeft: 'none', borderBottom: isLoginTab ? '2px solid var(--secondary)' : 'none' }}
          >
            <LogIn className="w-4 h-4" />
            Acceder
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            className={`sidebar-btn ${!isLoginTab ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', borderRadius: '8px 8px 0 0', borderLeft: 'none', borderBottom: !isLoginTab ? '2px solid var(--secondary)' : 'none' }}
          >
            <UserPlus className="w-4 h-4" />
            Registrarse
          </button>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--error)', fontSize: '0.9rem' }}>
            <AlertCircle className="w-5 h-5" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ whiteSpace: 'pre-wrap' }}>{errorMsg}</div>
          </div>
        )}

        {isLoginTab ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Correo Electrónico</label>
              <input
                type="email"
                className="glass-input"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Contraseña</label>
              <input
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="glass-button" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Nombre Completo</label>
              <input
                type="text"
                className="glass-input"
                placeholder="Tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Correo Electrónico</label>
              <input
                type="email"
                className="glass-input"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Contraseña</label>
              <input
                type="password"
                className="glass-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rol en la Plataforma</label>
              <select
                className="glass-input"
                value={role}
                onChange={e => setRole(e.target.value as any)}
                disabled={loading}
                style={{ appearance: 'none', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="STUDENT" style={{ background: '#0b0f19' }}>Estudiante / Investigador</option>
                <option value="DATA_CLEANER" style={{ background: '#0b0f19' }}>Data Cleaner / Revisor</option>
                <option value="ADMIN" style={{ background: '#0b0f19' }}>Administrador</option>
              </select>
            </div>
            <button type="submit" className="glass-button" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
