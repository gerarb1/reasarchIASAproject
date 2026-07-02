import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'w-full rounded-lg border px-3.5 py-2.5 pr-10',
              'text-sm font-normal appearance-none',
              'transition-colors duration-200',
              'outline-none cursor-pointer',
              // Light
              'bg-white border-slate-300 text-slate-900',
              'focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20',
              // Dark
              'dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50',
              'dark:focus:border-accent-400 dark:focus:ring-accent-400/20',
              // Disabled
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              'dark:disabled:bg-slate-800/30 dark:disabled:text-slate-600',
              // Error
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                : '',
              className,
            ].join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
