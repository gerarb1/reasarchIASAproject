import React from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { LogOut, User, Database, ShieldAlert, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role) {
      case 'ADMIN':
        return <ShieldAlert className="w-4 h-4" />;
      case 'DATA_CLEANER':
        return <Database className="w-4 h-4" />;
      case 'STUDENT':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'ADMIN': return 'Administrador';
      case 'DATA_CLEANER': return 'Revisor';
      case 'STUDENT': return 'Estudiante';
      default: return user.role;
    }
  };

  return (
    <header className="portal-header">
      <div className="logo" style={{ fontSize: '1.3rem' }}>ResearchCore</div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          
          <span className={`badge ${user.role.toLowerCase()}`}>
            {getRoleIcon()}
            {getRoleLabel()}
          </span>
        </div>

        <button onClick={logout} className="glass-button secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  );
};
