import React from 'react';
import { LogOut, Menu, ShieldAlert, Database, GraduationCap } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { UserRole } from './Sidebar';

interface HeaderProps {
  sectionTitle: string;
  role: UserRole;
  userName: string;
  onLogout: () => void;
  onMenuToggle: () => void;
}

function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return { label: 'Administrador', variant: 'admin' as const, icon: <ShieldAlert className="w-3 h-3" /> };
    case 'DATA_CLEANER':
      return { label: 'Revisor', variant: 'cleaner' as const, icon: <Database className="w-3 h-3" /> };
    case 'STUDENT':
      return { label: 'Estudiante', variant: 'student' as const, icon: <GraduationCap className="w-3 h-3" /> };
    default:
      return { label: role, variant: 'default' as const, icon: null };
  }
}

export const Header: React.FC<HeaderProps> = ({
  sectionTitle,
  role,
  userName,
  onLogout,
  onMenuToggle,
}) => {
  const roleBadge = getRoleBadge(role);

  return (
    <header
      className={[
        'h-16 flex items-center justify-between px-6 border-b shrink-0',
        'bg-white/80 backdrop-blur-md border-slate-200',
        'dark:bg-slate-900/80 dark:border-slate-800',
        'sticky top-0 z-30',
      ].join(' ')}
    >
      {/* ── Left: Menu + Title ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className={[
            'lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg',
            'text-slate-600 hover:bg-slate-100',
            'dark:text-slate-400 dark:hover:bg-slate-800',
            'transition-colors duration-200 cursor-pointer',
          ].join(' ')}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-50">
          {sectionTitle}
        </h1>
      </div>

      {/* ── Right: Role + ThemeToggle + Logout ── */}
      <div className="flex items-center gap-3">
        <Badge variant={roleBadge.variant} icon={roleBadge.icon}>
          {roleBadge.label}
        </Badge>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        <ThemeToggle />

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        <Button
          variant="ghost"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
          onClick={onLogout}
        >
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
};
