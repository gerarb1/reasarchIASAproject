import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { UserRole } from './Sidebar';
import { X } from 'lucide-react';

interface DashboardLayoutProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  /** The currently active section ID */
  activeSection: string;
  /** Called when the user selects a different section */
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

/** Returns a human-readable section title from the section ID */
function getSectionTitle(sectionId: string): string {
  const titles: Record<string, string> = {
    // Admin
    projects: 'Proyectos Activos',
    users: 'Gestión de Usuarios',
    // Cleaner
    quarantine: 'Bandeja Científica',
    reviewer: 'Evaluación de Papers',
    'data-workspace': 'Limpieza de Datos (R Engine)',
    // Student
    'my-projects': 'Mis Proyectos',
  };
  return titles[sectionId] || 'Dashboard';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  userName,
  userEmail,
  onLogout,
  activeSection,
  onSectionChange,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionChange = useCallback(
    (section: string) => {
      onSectionChange(section);
      setMobileMenuOpen(false); // close mobile menu on nav
    },
    [onSectionChange]
  );

  const sectionTitle = getSectionTitle(activeSection);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* ── Mobile Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar — Desktop ── */}
      <div className="hidden lg:flex">
        <Sidebar
          role={role}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      {/* ── Sidebar — Mobile Drawer ── */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 lg:hidden',
          'transition-transform duration-300 ease-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="relative h-full">
          <Sidebar
            role={role}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            collapsed={false}
            onToggleCollapse={() => setMobileMenuOpen(false)}
            userName={userName}
            userEmail={userEmail}
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={[
              'absolute top-4 -right-10 w-8 h-8 rounded-full flex items-center justify-center',
              'bg-white dark:bg-slate-800 shadow-lg',
              'text-slate-600 dark:text-slate-400',
              'cursor-pointer',
            ].join(' ')}
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          sectionTitle={sectionTitle}
          role={role}
          userName={userName}
          onLogout={onLogout}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
