import React from 'react';

/* ── Card Container ── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={[
        'rounded-xl border transition-all duration-200',
        // Light mode
        'bg-white border-slate-200 shadow-card',
        // Dark mode
        'dark:bg-slate-900 dark:border-slate-800 dark:shadow-none',
        // Hoverable variant
        hoverable
          ? 'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

/* ── Card Header ── */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={[
        'px-6 py-4 border-b border-slate-100 dark:border-slate-800',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

/* ── Card Content ── */
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={['px-6 py-5', className].join(' ')} {...props}>
      {children}
    </div>
  );
};

/* ── Card Footer ── */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={[
        'px-6 py-4 border-t border-slate-100 dark:border-slate-800',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};
