export function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  className = ''
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-text tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-silver leading-relaxed max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

export default PageHeader;

