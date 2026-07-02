import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent-600 text-white',
    'hover:bg-accent-700 active:bg-accent-800',
    'dark:bg-accent-500 dark:hover:bg-accent-400 dark:active:bg-accent-500',
    'dark:text-slate-950',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-accent-500',
  ].join(' '),
  secondary: [
    'bg-slate-100 text-slate-900 border border-slate-200',
    'hover:bg-slate-200 active:bg-slate-300',
    'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
    'dark:hover:bg-slate-700 dark:active:bg-slate-600',
    'focus-visible:ring-slate-400',
  ].join(' '),
  ghost: [
    'bg-transparent text-slate-700',
    'hover:bg-slate-100 active:bg-slate-200',
    'dark:text-slate-300',
    'dark:hover:bg-slate-800 dark:active:bg-slate-700',
    'focus-visible:ring-slate-400',
  ].join(' '),
  destructive: [
    'bg-red-600 text-white',
    'hover:bg-red-700 active:bg-red-800',
    'dark:bg-red-500 dark:hover:bg-red-400 dark:active:bg-red-500',
    'dark:text-white',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-red-500',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-2.5 text-base gap-2.5 rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Loader2
          className={`animate-spin ${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`}
        />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
