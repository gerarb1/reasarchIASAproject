import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={[
        'relative inline-flex items-center justify-center',
        'w-9 h-9 rounded-lg',
        'transition-all duration-200 ease-out',
        'hover:bg-slate-100 active:bg-slate-200',
        'dark:hover:bg-slate-800 dark:active:bg-slate-700',
        'text-slate-600 dark:text-slate-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-slate-900',
        'cursor-pointer',
        className,
      ].join(' ')}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className="relative w-5 h-5">
        {/* Sun icon - visible in dark mode */}
        <Sun
          className={[
            'absolute inset-0 w-5 h-5 transition-all duration-500',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0',
          ].join(' ')}
        />
        {/* Moon icon - visible in light mode */}
        <Moon
          className={[
            'absolute inset-0 w-5 h-5 transition-all duration-500',
            isDark
              ? '-rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100',
          ].join(' ')}
        />
      </span>
    </button>
  );
};
