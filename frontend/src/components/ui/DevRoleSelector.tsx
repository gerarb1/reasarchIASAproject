import React, { useState } from 'react';
import { ShieldAlert, Database, GraduationCap, Bug } from 'lucide-react';
import type { UserRole } from '../../features/dashboard/Sidebar';

interface DevRoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles: { value: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'ADMIN', label: 'Admin', icon: <ShieldAlert className="w-3.5 h-3.5" />, color: 'text-red-500' },
  { value: 'DATA_CLEANER', label: 'Revisor', icon: <Database className="w-3.5 h-3.5" />, color: 'text-amber-500' },
  { value: 'STUDENT', label: 'Estudiante', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
];

/**
 * Floating dev-only widget to simulate role switching.
 * Only rendered when VITE_ENABLE_ROLE_SELECTOR=true
 */
export const DevRoleSelector: React.FC<DevRoleSelectorProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {/* Expanded panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-52 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-elevated animate-slide-up">
          <p className="px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Simular Rol
          </p>
          <div className="mt-1 space-y-0.5">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  onRoleChange(r.value);
                  setIsOpen(false);
                }}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                  currentRole === r.value
                    ? 'bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50',
                ].join(' ')}
              >
                <span className={r.color}>{r.icon}</span>
                {r.label}
                {currentRole === r.value && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={[
          'w-10 h-10 rounded-full flex items-center justify-center',
          'bg-amber-500 hover:bg-amber-400 text-white',
          'shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40',
          'transition-all duration-200 cursor-pointer',
          'hover:scale-105 active:scale-95',
          isOpen ? 'rotate-12' : '',
        ].join(' ')}
        title="Dev: Cambiar rol"
        aria-label="Selector de rol de desarrollo"
      >
        <Bug className="w-5 h-5" />
      </button>
    </div>
  );
};
