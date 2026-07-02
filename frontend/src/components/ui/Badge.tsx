import React from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'admin'
  | 'cleaner'
  | 'student'
  | 'pending'
  | 'approved'
  | 'rejected';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: [
    'bg-slate-100 text-slate-700 border-slate-200',
    'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  ].join(' '),
  success: [
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  ].join(' '),
  warning: [
    'bg-amber-50 text-amber-700 border-amber-200',
    'dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  ].join(' '),
  error: [
    'bg-red-50 text-red-700 border-red-200',
    'dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  ].join(' '),
  info: [
    'bg-blue-50 text-blue-700 border-blue-200',
    'dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  ].join(' '),
  admin: [
    'bg-red-50 text-red-700 border-red-200',
    'dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  ].join(' '),
  cleaner: [
    'bg-amber-50 text-amber-700 border-amber-200',
    'dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  ].join(' '),
  student: [
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  ].join(' '),
  pending: [
    'bg-amber-50 text-amber-700 border-amber-200',
    'dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  ].join(' '),
  approved: [
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  ].join(' '),
  rejected: [
    'bg-red-50 text-red-700 border-red-200',
    'dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  ].join(' '),
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-0.5 rounded-md',
        'text-xs font-semibold uppercase tracking-wide',
        'border',
        'transition-colors duration-200',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
