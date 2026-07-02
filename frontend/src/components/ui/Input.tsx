import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
          >
            {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border px-3.5 py-2.5',
            'text-sm font-normal',
            'transition-colors duration-200',
            'outline-none',
            // Light
            'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
            'focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20',
            // Dark
            'dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 dark:placeholder:text-slate-500',
            'dark:focus:border-accent-400 dark:focus:ring-accent-400/20',
            // Disabled
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200',
            'dark:disabled:bg-slate-800/30 dark:disabled:text-slate-600 dark:disabled:border-slate-800',
            // Error
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-400'
              : '',
            // Icon padding
            icon && !label ? 'pl-10' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ── Textarea variant ── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'w-full rounded-lg border px-3.5 py-2.5',
            'text-sm font-normal resize-vertical',
            'transition-colors duration-200',
            'outline-none',
            'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
            'focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20',
            'dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 dark:placeholder:text-slate-500',
            'dark:focus:border-accent-400 dark:focus:ring-accent-400/20',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            'dark:disabled:bg-slate-800/30 dark:disabled:text-slate-600',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
              : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
