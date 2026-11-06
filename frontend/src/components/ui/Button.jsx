import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary text-primary-fg hover:opacity-90 active:scale-[0.99] font-semibold border border-transparent shadow-xs',
  secondary: 'bg-surface-2 text-text border border-border hover:bg-surface-hover active:scale-[0.99] font-medium shadow-xs',
  accent: 'bg-primary text-primary-fg hover:opacity-90 active:scale-[0.99] font-semibold border border-transparent shadow-xs',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface-2 active:scale-[0.99]',
  danger: 'bg-error text-error-fg border border-error/30 hover:opacity-90 active:scale-[0.99] shadow-xs',
  outline: 'border border-border bg-transparent text-text hover:bg-surface-2 active:scale-[0.99]'
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5 font-medium',
  md: 'h-10 px-4 text-sm rounded-lg gap-2 font-medium',
  lg: 'h-12 px-5 text-[15px] rounded-lg gap-2.5 font-semibold'
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;

