import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ page = 0, totalPages = 1, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${className}`}>
      <p className="text-xs text-muted">
        Page <span className="font-medium text-text">{page + 1}</span> of{' '}
        <span className="font-medium text-text">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;

