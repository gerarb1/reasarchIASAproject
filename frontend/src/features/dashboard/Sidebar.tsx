import React from 'react';
import {
  FlaskConical,
  Users,
  UserPlus,
  Folder,
  FolderPlus,
  FileText,
  Upload,
  Filter,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'STUDENT' | 'DATA_CLEANER';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/** Returns the sidebar navigation items based on the user role */
export function getNavItemsForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { id: 'projects', label: 'Proyectos', icon: <Folder className="w-5 h-5" /> },
        { id: 'users', label: 'Usuarios / Roles', icon: <Users className="w-5 h-5" /> },
      ];
    case 'DATA_CLEANER':
      return [
        { id: 'quarantine', label: 'Bandeja Científica', icon: <Filter className="w-5 h-5" /> },
      ];
    case 'STUDENT':
      return [
        { id: 'my-projects', label: 'Mis Proyectos', icon: <FileText className="w-5 h-5" /> },
      ];
    default:
      return [];
  }
}

interface SidebarProps {
  role: UserRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName?: string;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  userName,
  userEmail,
}) => {
  const navItems = getNavItemsForRole(role);

  return (
    <aside
      className={[
        'flex flex-col h-full border-r transition-all duration-300 ease-out',
        'bg-white border-slate-200',
        'dark:bg-slate-900 dark:border-slate-800',
        collapsed ? 'w-[68px]' : 'w-64',
      ].join(' ')}
    >
      {/* ── Brand ── */}
      <div
        className={[
          'flex items-center h-16 px-4 border-b',
          'border-slate-200 dark:border-slate-800',
          collapsed ? 'justify-center' : 'gap-3',
        ].join(' ')}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-600 dark:bg-accent-500 shrink-0">
          <FlaskConical className="w-4.5 h-4.5 text-white dark:text-slate-950" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-50 truncate">
            ResearchCore
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Navegación
          </p>
        )}
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={[
                'w-full flex items-center gap-3 rounded-lg transition-all duration-200',
                'text-sm font-medium cursor-pointer',
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
              ].join(' ')}
            >
              <span className={[
                'shrink-0 transition-colors duration-200',
                isActive ? 'text-accent-600 dark:text-accent-400' : '',
              ].join(' ')}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-500 dark:bg-accent-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── User Info Footer ── */}
      {userName && (
        <div
          className={[
            'border-t border-slate-200 dark:border-slate-800 p-3',
            collapsed ? 'flex justify-center' : '',
          ].join(' ')}
        >
          {collapsed ? (
            <div
              className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center text-accent-700 dark:text-accent-400 text-xs font-bold"
              title={userName}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center text-accent-700 dark:text-accent-400 text-xs font-bold shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Collapse Toggle ── */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2">
        <button
          onClick={onToggleCollapse}
          className={[
            'w-full flex items-center justify-center rounded-lg p-2',
            'text-slate-400 hover:text-slate-600 hover:bg-slate-50',
            'dark:text-slate-600 dark:hover:text-slate-400 dark:hover:bg-slate-800',
            'transition-colors duration-200 cursor-pointer',
          ].join(' ')}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
