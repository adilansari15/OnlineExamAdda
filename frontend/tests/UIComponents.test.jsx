import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';
import { Card, CardTitle } from '../src/components/ui/Card';
import { StatCard } from '../src/components/ui/StatCard';

describe('Shared UI Components', () => {
  it('renders Button with variants and sizes', () => {
    const { rerender } = render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');

    rerender(<Button variant="danger" size="lg">Delete</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Delete');
  });

  it('renders Badge with difficulty styles', () => {
    const { rerender } = render(<Badge difficulty="EASY" />);
    expect(screen.getByText('EASY')).toBeInTheDocument();

    rerender(<Badge difficulty="HARD" />);
    expect(screen.getByText('HARD')).toBeInTheDocument();
  });

  it('renders Card and StatCard with tabular values', () => {
    render(
      <div>
        <Card>
          <CardTitle>Test Card Title</CardTitle>
        </Card>
        <StatCard title="Accuracy" value="88.5%" />
      </div>
    );

    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('88.5%')).toBeInTheDocument();
  });
});

