import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import RoleRoute from '../src/routes/RoleRoute';
import * as AuthContextModule from '../src/context/AuthContext';

describe('Route Guards', () => {
  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('allows access to protected routes when authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'ROLE_STUDENT', fullName: 'Student User' }
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('redirects student accessing admin route to /unauthorized', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'ROLE_STUDENT', fullName: 'Student User' }
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Access Denied</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                <div>Admin Secret</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Secret')).not.toBeInTheDocument();
  });

  it('allows admin access to admin role routes', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'ROLE_ADMIN', fullName: 'Admin User' }
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                <div>Admin Secret</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Secret')).toBeInTheDocument();
  });
});

