import React, { useState } from 'react';
import { useAuth } from './features/auth/context/AuthContext';
import { Login } from './features/auth/components/Login';
import { AdminDashboard } from './features/projects/components/AdminDashboard';
import { StudentDashboard } from './features/projects/components/StudentDashboard';
import { CleanerDashboard } from './features/papers/components/CleanerDashboard';
import { Navbar } from './components/ui/Navbar';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }
    setToast({ message, type });
    const id = window.setTimeout(() => {
      setToast(null);
    }, 3500);
    setToastTimeoutId(id);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79,172,254,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando sesión...</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!user ? (
        <Login showToast={showToast} />
      ) : (
        <div className="portal-layout">
          <Navbar />
          {user.role === 'ADMIN' && <AdminDashboard showToast={showToast} />}
          {user.role === 'STUDENT' && <StudentDashboard showToast={showToast} />}
          {user.role === 'DATA_CLEANER' && <CleanerDashboard showToast={showToast} />}
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className={`alert-toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
