import { Card } from './Card';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  className = ''
}) {
  return (
    <Card className={`p-5.5 flex flex-col justify-between hover:border-border-strong transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text border border-border/80 shrink-0">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold text-primary tracking-tight tabular-nums">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            {trend && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                  trend > 0 ? 'bg-success text-success-fg border border-success-border' : trend < 0 ? 'bg-error text-error-fg border border-error-border' : 'bg-surface-2 text-muted'
                }`}
              >
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
            {trendLabel && <span className="text-silver">{trendLabel}</span>}
            {subtitle && !trendLabel && <span className="truncate text-muted">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;

