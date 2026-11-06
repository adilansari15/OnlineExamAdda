import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import StudentLayout from '../src/layouts/StudentLayout';
import AdminLayout from '../src/layouts/AdminLayout';

describe('Layout Shells', () => {
  it('renders StudentLayout with all navigation links', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/app/overview']}>
            <StudentLayout />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getAllByText('Overview').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Explore Quizzes')).toBeInTheDocument();
    expect(screen.getByText('My Attempts')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders AdminLayout with admin navigation links', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <AdminLayout />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Question Bank')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
