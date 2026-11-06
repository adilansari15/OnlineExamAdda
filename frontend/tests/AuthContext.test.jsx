import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

function TestAuthConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="is-auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user-email">{user?.email || 'none'}</span>
      <button
        onClick={() =>
          login({ email: 'test@example.com', password: 'Pass123Password' })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes as unauthenticated when no token exists', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
  });

  it('logs in successfully and sets user state', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: 'mock.jwt.token',
        user: {
          id: 1,
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'ROLE_STUDENT',
          enabled: true
        }
      }
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('is-auth')).toHaveTextContent('yes');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(localStorage.getItem('token')).toBe('mock.jwt.token');
  });

  it('logs out and clears localStorage token', async () => {
    localStorage.setItem('token', 'existing.token');
    api.get.mockResolvedValueOnce({
      data: {
        id: 1,
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ROLE_STUDENT',
        enabled: true
      }
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
    expect(localStorage.getItem('token')).toBeNull();
  });
});

