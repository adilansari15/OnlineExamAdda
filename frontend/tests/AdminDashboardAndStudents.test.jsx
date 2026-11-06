import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminSettings from '@/pages/admin/AdminSettings';
import { adminService } from '@/services/adminService';
import { ThemeProvider } from '@/context/ThemeContext';

vi.mock('@/services/adminService', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getStudents: vi.fn(),
    getStudentById: vi.fn(),
    updateStudentStatus: vi.fn(),
    changePassword: vi.fn()
  }
}));

const mockDashboard = {
  totalStudents: 142,
  totalQuizzes: 12,
  totalQuestions: 250,
  totalAttempts: 560,
  publishedQuizzes: 10,
  draftQuizzes: 2,
  activeCategories: 6,
  recentActivity: [
    {
      id: 'student-1',
      type: 'STUDENT_REGISTERED',
      title: 'New Student Enrolled',
      description: 'John Doe (john@example.com) registered',
      timestamp: '2026-11-04T12:00:00Z'
    },
    {
      id: 'quiz-1',
      type: 'QUIZ_CREATED',
      title: 'Quiz Created: Java Basics',
      description: 'Status: PUBLISHED | Category: Java',
      timestamp: '2026-11-04T11:00:00Z'
    }
  ]
};

const mockStudents = {
  content: [
    {
      id: 101,
      fullName: 'Alice Walker',
      email: 'alice@examadda.local',
      phone: '9876543210',
      enabled: true,
      totalAttempts: 3,
      createdAt: '2026-11-01T10:00:00Z'
    },
    {
      id: 102,
      fullName: 'Bob Marley',
      email: 'bob@examadda.local',
      phone: null,
      enabled: false,
      totalAttempts: 0,
      createdAt: '2026-11-02T10:00:00Z'
    }
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 10
};

describe('Admin Dashboard, Students & Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AdminDashboard', () => {
    it('renders KPI metrics and recent platform activity', async () => {
      adminService.getDashboard.mockResolvedValueOnce({ data: mockDashboard });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('142')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('250')).toBeInTheDocument();
        expect(screen.getByText('560')).toBeInTheDocument();
      });

      expect(screen.getByText('New Student Enrolled')).toBeInTheDocument();
      expect(screen.getByText('Quiz Created: Java Basics')).toBeInTheDocument();
      expect(screen.getByText('Manage Quizzes')).toBeInTheDocument();
    });

    it('renders empty activity message when recentActivity is empty', async () => {
      adminService.getDashboard.mockResolvedValueOnce({
        data: { ...mockDashboard, recentActivity: [] }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No recent activity recorded yet.')).toBeInTheDocument();
      });
    });
  });

  describe('AdminStudents', () => {
    it('renders student list and allows viewing details', async () => {
      adminService.getStudents.mockResolvedValueOnce({ data: mockStudents });
      adminService.getStudentById.mockResolvedValueOnce({
        data: {
          id: 101,
          fullName: 'Alice Walker',
          email: 'alice@examadda.local',
          enabled: true,
          totalAttempts: 3,
          completedAttempts: 2,
          createdAt: '2026-11-01T10:00:00Z'
        }
      });

      render(<AdminStudents />);

      await waitFor(() => {
        expect(screen.getByText('Alice Walker')).toBeInTheDocument();
        expect(screen.getByText('bob@examadda.local')).toBeInTheDocument();
      });

      // Click view details for Alice
      const viewButtons = screen.getAllByRole('button', { name: /View details for Alice Walker/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Student Profile')).toBeInTheDocument();
        expect(screen.getByText('Total Exam Attempts')).toBeInTheDocument();
      });
    });

    it('opens toggle status modal and confirms enable/disable status update', async () => {
      adminService.getStudents.mockResolvedValueOnce({ data: mockStudents });
      adminService.updateStudentStatus.mockResolvedValueOnce({
        data: { id: 101, fullName: 'Alice Walker', enabled: false }
      });

      render(<AdminStudents />);

      await waitFor(() => {
        expect(screen.getByText('Alice Walker')).toBeInTheDocument();
      });

      // Click Disable button for Alice
      const disableBtn = screen.getByRole('button', { name: /Disable Alice Walker/i });
      fireEvent.click(disableBtn);

      await waitFor(() => {
        expect(screen.getByText('Disable Student Account?')).toBeInTheDocument();
      });

      // Click confirm disable
      const confirmBtn = screen.getByRole('button', { name: /Yes, Disable Account/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(adminService.updateStudentStatus).toHaveBeenCalledWith(101, false);
      });
    });
  });

  describe('AdminSettings', () => {
    it('validates password mismatch and calls changePassword on valid submit', async () => {
      adminService.changePassword.mockResolvedValueOnce({ message: 'Success' });

      render(
        <ThemeProvider>
          <AdminSettings />
        </ThemeProvider>
      );

      const currentInput = screen.getByLabelText(/Current Password/i);
      const newInput = screen.getByLabelText(/^New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm New Password/i);
      const submitBtn = screen.getByRole('button', { name: /Update Password/i });

      // Mismatched passwords
      fireEvent.change(currentInput, { target: { value: 'OldPass123' } });
      fireEvent.change(newInput, { target: { value: 'NewSecret123' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/New password and confirmation do not match/i)).toBeInTheDocument();
      expect(adminService.changePassword).not.toHaveBeenCalled();

      // Matching passwords
      fireEvent.change(confirmInput, { target: { value: 'NewSecret123' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(adminService.changePassword).toHaveBeenCalledWith('OldPass123', 'NewSecret123');
        expect(screen.getByText(/Your administrator password has been updated successfully/i)).toBeInTheDocument();
      });
    });

    it('renders theme selector buttons', () => {
      render(
        <ThemeProvider>
          <AdminSettings />
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /Light/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Dark/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /System/i })).toBeInTheDocument();
    });
  });
});

