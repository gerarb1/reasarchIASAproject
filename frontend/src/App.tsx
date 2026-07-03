import React, { useState, useCallback } from 'react';
import { useAuth } from './features/auth/context/AuthContext';
import { Login } from './features/auth/components/Login';
import { AdminDashboard } from './features/projects/components/AdminDashboard';
import { StudentDashboard } from './features/projects/components/StudentDashboard';
import { CleanerDashboard } from './features/papers/components/CleanerDashboard';
import { ReviewerDashboard } from './features/papers/components/ReviewerDashboard';
import { DataCleanerWorkspace } from './features/papers/components/DataCleanerWorkspace';
import { DashboardLayout } from './features/dashboard/DashboardLayout';
import { DevRoleSelector } from './components/ui/DevRoleSelector';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { getNavItemsForRole } from './features/dashboard/Sidebar';

export const App: React.FC = () => {
  const { user, isLoading, logout, overrideRole, isRoleSelectorEnabled } = useAuth();

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<number | null>(null);

  // Active section state
  const [activeSection, setActiveSection] = useState<string>('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }
    setToast({ message, type });
    const id = window.setTimeout(() => {
      setToast(null);
    }, 3500);
    setToastTimeoutId(id);
  }, [toastTimeoutId]);

  const getEffectiveSection = () => {
    if (user) {
      const navItems = getNavItemsForRole(user.role);
      if (activeSection && navItems.some(item => item.id === activeSection)) {
        return activeSection;
      }
      return navItems[0]?.id || '';
    }
    return '';
  };

  const effectiveSection = getEffectiveSection();

  const handleRoleOverride = useCallback((role: typeof user extends null ? never : NonNullable<typeof user>['role']) => {
    overrideRole(role);
    const newNavItems = getNavItemsForRole(role);
    setActiveSection(newNavItems[0]?.id || '');
  }, [overrideRole]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-accent-600 dark:text-accent-400 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Login showToast={showToast} />
      ) : (
        <DashboardLayout
          role={user.role}
          userName={user.name}
          userEmail={user.email}
          onLogout={logout}
          activeSection={effectiveSection}
          onSectionChange={setActiveSection}
        >
          {/* ── ADMIN ── */}
          {user.role === 'ADMIN' && (
            <AdminDashboard showToast={showToast} activeSection={effectiveSection} />
          )}

          {/* ── STUDENT ── */}
          {user.role === 'STUDENT' && (
            <StudentDashboard showToast={showToast} />
          )}

          {/* ── DATA_CLEANER: Multiple Sections ── */}
          {user.role === 'DATA_CLEANER' && effectiveSection === 'quarantine' && (
            <CleanerDashboard showToast={showToast} />
          )}
          {user.role === 'DATA_CLEANER' && effectiveSection === 'reviewer' && (
            <ReviewerDashboard showToast={showToast} />
          )}
          {user.role === 'DATA_CLEANER' && effectiveSection === 'data-workspace' && (
            <DataCleanerWorkspace showToast={showToast} />
          )}
        </DashboardLayout>
      )}

      {/* Dev Role Selector */}
      {isRoleSelectorEnabled && user && (
        <DevRoleSelector
          currentRole={user.role}
          onRoleChange={handleRoleOverride}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={[
            'fixed bottom-6 right-6 z-[90] flex items-center gap-3',
            'px-4 py-3 rounded-xl shadow-elevated',
            'text-sm font-medium text-white',
            'animate-slide-in-right',
            toast.type === 'success'
              ? 'bg-emerald-600 dark:bg-emerald-500'
              : 'bg-red-600 dark:bg-red-500',
          ].join(' ')}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
};

export default App;
