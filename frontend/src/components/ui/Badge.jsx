const variants = {
  default: 'bg-surface-2 text-silver border-border',
  primary: 'bg-surface-2 text-text border-border-strong',
  accent: 'bg-surface-2 text-text border-border-strong',
  success: 'bg-success text-success-fg border-success-border',
  warning: 'bg-warning text-warning-fg border-warning-border',
  error: 'bg-error text-error-fg border-error-border',
  review: 'bg-review text-review-fg border-review-border'
};

const sizes = {
  sm: 'px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
  md: 'px-3 py-1 text-xs font-semibold tracking-wide'
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  difficulty,
  className = '',
  ...props
}) {
  let resolvedVariant = variant;
  if (difficulty) {
    const diff = String(difficulty).toUpperCase();
    if (diff === 'EASY') resolvedVariant = 'success';
    else if (diff === 'MEDIUM') resolvedVariant = 'warning';
    else if (diff === 'HARD') resolvedVariant = 'error';
  }

  const variantClass = variants[resolvedVariant] || variants.default;
  const sizeClass = sizes[size] || sizes.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantClass} ${sizeClass} transition-colors ${className}`}
      {...props}
    >
      {children || difficulty}
    </span>
  );
}

export default Badge;

