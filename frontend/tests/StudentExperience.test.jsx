import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import ExploreQuizzes from '@/pages/student/ExploreQuizzes';
import QuizDetail from '@/pages/student/QuizDetail';
import Overview from '@/pages/student/Overview';
import Profile from '@/pages/student/Profile';
import { studentService } from '@/services/studentService';
import { categoryService } from '@/services/categoryService';
import { AuthContext } from '@/context/AuthContext';

vi.mock('@/services/studentService', () => ({
  studentService: {
    getQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    getDashboard: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn()
  }
}));

vi.mock('@/services/categoryService', () => ({
  categoryService: {
    getActiveCategories: vi.fn()
  }
}));

const mockQuizzes = {
  content: [
    {
      id: 1,
      title: 'Java Masterclass Exam',
      description: 'Test on Core Java & OOP',
      categoryId: 10,
      categoryName: 'Java Programming',
      difficulty: 'MEDIUM',
      questionCount: 30,
      durationMinutes: 45,
      totalMarks: 120,
      hasNegativeMarking: true,
      negativeMarks: 1.0,
      attemptCount: 15
    }
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 9
};

const mockCategories = [
  { id: 10, name: 'Java Programming', slug: 'java-programming' },
  { id: 20, name: 'Python Basics', slug: 'python-basics' }
];

const mockQuizDetail = {
  id: 1,
  title: 'Java Masterclass Exam',
  description: 'Test on Core Java & OOP',
  instructions: '1. No aids permitted.\n2. Negative marking applies.',
  categoryId: 10,
  categoryName: 'Java Programming',
  difficulty: 'MEDIUM',
  questionCount: 30,
  durationMinutes: 45,
  totalMarks: 120,
  marksPerQuestion: 4.0,
  negativeMarks: 1.0,
  maxAttempts: 3,
  attemptsUsed: 1,
  canAttempt: true,
  cannotAttemptReason: null,
  inProgressAttemptId: null
};

const mockDashboard = {
  stats: {
    quizzesAttempted: 1,
    averageScore: 85.0,
    accuracyPercentage: 90.0,
    questionsAttempted: 30
  },
  continueLearning: [],
  recommendedQuizzes: [mockQuizzes.content[0]],
  upcomingExams: [],
  recentActivity: [
    {
      id: 'activity-1',
      title: 'Exam Submitted',
      description: 'Quiz: Java Masterclass Exam (SUBMITTED)',
      timestamp: '2026-11-05T10:00:00Z'
    }
  ]
};

const mockAuthUser = {
  user: { id: 100, fullName: 'Alex Student', email: 'alex@examadda.local', role: 'ROLE_STUDENT' },
  token: 'mock-token',
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
};

describe('Student Experience Suite (Phase 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ExploreQuizzes', () => {
    it('fetches and renders published quizzes with category chips', async () => {
      categoryService.getActiveCategories.mockResolvedValueOnce({ data: mockCategories });
      studentService.getQuizzes.mockResolvedValueOnce({ data: mockQuizzes });

      render(
        <BrowserRouter>
          <ExploreQuizzes />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Java Masterclass Exam')).toBeInTheDocument();
        expect(screen.getByText('45m')).toBeInTheDocument();
        expect(screen.getAllByText('Java Programming').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders empty state when no quizzes match query', async () => {
      categoryService.getActiveCategories.mockResolvedValueOnce({ data: mockCategories });
      studentService.getQuizzes.mockResolvedValueOnce({
        data: { content: [], totalElements: 0, totalPages: 1 }
      });

      render(
        <BrowserRouter>
          <ExploreQuizzes />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No quizzes found')).toBeInTheDocument();
      });
    });
  });

  describe('QuizDetail', () => {
    it('renders exam structure and requires agreement before starting', async () => {
      studentService.getQuizById.mockResolvedValueOnce({ data: mockQuizDetail });

      render(
        <MemoryRouter initialEntries={['/app/quizzes/1']}>
          <Routes>
            <Route path="/app/quizzes/:id" element={<QuizDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Java Masterclass Exam')).toBeInTheDocument();
        expect(screen.getByText('45 Minutes')).toBeInTheDocument();
        expect(screen.getByText('30 MCQs')).toBeInTheDocument();
      });

      const startButton = screen.getByRole('button', { name: /Start Examination/i });
      expect(startButton).toBeDisabled();

      // Check confirmation checkbox
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(startButton).toBeEnabled();
    });

    it('disables start exam and displays warning if cannotAttempt is false', async () => {
      studentService.getQuizById.mockResolvedValueOnce({
        data: {
          ...mockQuizDetail,
          canAttempt: false,
          cannotAttemptReason: 'Maximum attempt limit reached (3/3)'
        }
      });

      render(
        <MemoryRouter initialEntries={['/app/quizzes/1']}>
          <Routes>
            <Route path="/app/quizzes/:id" element={<QuizDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Maximum attempt limit reached/i)).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const startButton = screen.getByRole('button', { name: /Start Examination/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('Overview (Student Dashboard)', () => {
    it('renders welcome banner, KPI metrics, and recommended exams', async () => {
      studentService.getDashboard.mockResolvedValueOnce({ data: mockDashboard });

      render(
        <AuthContext.Provider value={mockAuthUser}>
          <BrowserRouter>
            <Overview />
          </BrowserRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Alex Student!/i)).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('90%')).toBeInTheDocument();
        expect(screen.getByText('Exam Submitted')).toBeInTheDocument();
      });
    });
  });

  describe('Profile', () => {
    it('loads student profile and updates personal details', async () => {
      studentService.getProfile.mockResolvedValueOnce({
        data: {
          id: 100,
          fullName: 'Alex Student',
          email: 'alex@examadda.local',
          phone: '9876543210',
          avatarUrl: '',
          createdAt: '2026-11-01T10:00:00Z'
        }
      });
      studentService.updateProfile.mockResolvedValueOnce({
        data: { id: 100, fullName: 'Alex Updated', phone: '9876543210' }
      });

      render(
        <AuthContext.Provider value={mockAuthUser}>
          <Profile />
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Alex Student')).toBeInTheDocument();
        expect(screen.getByDisplayValue('alex@examadda.local')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Alex Student');
      fireEvent.change(nameInput, { target: { value: 'Alex Updated' } });

      const saveButton = screen.getByRole('button', { name: /Save Profile Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(studentService.updateProfile).toHaveBeenCalledWith({
          fullName: 'Alex Updated',
          phone: '9876543210',
          avatarUrl: null
        });
        expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
      });
    });

    it('validates password mismatch and calls changePassword on valid submit', async () => {
      studentService.getProfile.mockResolvedValueOnce({
        data: { id: 100, fullName: 'Alex Student', email: 'alex@examadda.local' }
      });
      studentService.changePassword.mockResolvedValueOnce({ message: 'Success' });

      render(
        <AuthContext.Provider value={mockAuthUser}>
          <Profile />
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Alex Student')).toBeInTheDocument();
      });

      const currentInput = screen.getByLabelText(/Current Password/i);
      const newInput = screen.getByLabelText(/^New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm New Password/i);
      const updateButton = screen.getByRole('button', { name: /Update Password/i });

      // Mismatched passwords
      fireEvent.change(currentInput, { target: { value: 'OldPass123' } });
      fireEvent.change(newInput, { target: { value: 'NewSecret123' } });
      fireEvent.change(confirmInput, { target: { value: 'Mismatch123' } });
      fireEvent.click(updateButton);

      expect(screen.getByText(/New password and confirmation do not match/i)).toBeInTheDocument();
      expect(studentService.changePassword).not.toHaveBeenCalled();

      // Matching passwords
      fireEvent.change(confirmInput, { target: { value: 'NewSecret123' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(studentService.changePassword).toHaveBeenCalledWith('OldPass123', 'NewSecret123');
        expect(screen.getByText(/Password has been changed successfully!/i)).toBeInTheDocument();
      });
    });
  });
});
