import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ExamScreen from '@/pages/student/ExamScreen';
import ResultDashboard from '@/pages/student/ResultDashboard';
import MyAttempts from '@/pages/student/MyAttempts';
import Performance from '@/pages/student/Performance';
import AdminResults from '@/pages/admin/AdminResults';
import { examService } from '@/services/examService';
import { resultService } from '@/services/resultService';
import { quizService } from '@/services/quizService';
import { ToastProvider } from '@/context/ToastContext';

vi.mock('@/services/examService');
vi.mock('@/services/resultService');
vi.mock('@/services/quizService');

describe('Exam Engine, Results & Analytics Suite (Phases 5, 6 & 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ExamScreen Component', () => {
    const mockAttemptData = {
      attemptId: 101,
      quizId: 5,
      quizTitle: 'Full-Stack Engineering Exam',
      status: 'IN_PROGRESS',
      totalQuestions: 2,
      totalMarks: 4.0,
      durationMinutes: 30,
      remainingSeconds: 1795,
      questions: [
        {
          questionId: 1,
          text: 'What is the primary role of an index in MySQL?',
          questionType: 'MCQ_SINGLE',
          marks: 2.0,
          negativeMarks: 0.5,
          position: 1,
          selectedOptionId: null,
          isMarkedForReview: false,
          options: [
            { id: 11, text: 'To speed up data retrieval operations', position: 1 },
            { id: 12, text: 'To encrypt sensitive data columns', position: 2 }
          ]
        },
        {
          questionId: 2,
          text: 'Which hook is used for memoized computations in React?',
          questionType: 'MCQ_SINGLE',
          marks: 2.0,
          negativeMarks: 0.5,
          position: 2,
          selectedOptionId: null,
          isMarkedForReview: false,
          options: [
            { id: 21, text: 'useMemo', position: 1 },
            { id: 22, text: 'useCallback', position: 2 }
          ]
        }
      ]
    };

    it('renders exam screen, questions, palette, and auto-saves answer selection', async () => {
      examService.getAttempt.mockResolvedValue({ data: mockAttemptData });
      examService.autosaveAnswer.mockResolvedValue({
        data: {
          success: true,
          questionId: 1,
          selectedOptionId: 11,
          isMarkedForReview: false,
          savedAt: '2026-11-05T20:00:00Z'
        }
      });

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/exam/101']}>
            <Routes>
              <Route path="/exam/:attemptId" element={<ExamScreen />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );

      // Verify quiz title and first question
      await waitFor(() => {
        expect(screen.getByText('Full-Stack Engineering Exam')).toBeInTheDocument();
      });

      expect(screen.getByText('What is the primary role of an index in MySQL?')).toBeInTheDocument();
      expect(screen.getByText('To speed up data retrieval operations')).toBeInTheDocument();

      // Click option 1 to answer
      const optionA = screen.getByText('To speed up data retrieval operations');
      fireEvent.click(optionA);

      await waitFor(() => {
        expect(examService.autosaveAnswer).toHaveBeenCalledWith(
          '101',
          1,
          expect.objectContaining({
            selectedOptionId: 11
          })
        );
      });
    });

    it('toggles mark for review and switches questions via palette', async () => {
      examService.getAttempt.mockResolvedValue({ data: mockAttemptData });
      examService.autosaveAnswer.mockResolvedValue({
        data: { success: true }
      });

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/exam/101']}>
            <Routes>
              <Route path="/exam/:attemptId" element={<ExamScreen />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Full-Stack Engineering Exam')).toBeInTheDocument();
      });

      // Click Mark for Review
      const reviewBtn = screen.getByText(/Mark for Review/i);
      fireEvent.click(reviewBtn);

      await waitFor(() => {
        expect(examService.autosaveAnswer).toHaveBeenCalledWith(
          '101',
          1,
          expect.objectContaining({
            markedForReview: true
          })
        );
      });

      // Switch to question 2 via palette button '2'
      const q2Button = screen.getByRole('button', { name: '2' });
      fireEvent.click(q2Button);

      expect(screen.getByText('Which hook is used for memoized computations in React?')).toBeInTheDocument();
    });
  });

  describe('ResultDashboard Component', () => {
    const mockResultData = {
      resultId: 50,
      attemptId: 101,
      quizTitle: 'Full-Stack Engineering Exam',
      categoryName: 'Computer Science',
      status: 'SUBMITTED',
      totalMarks: 4.0,
      obtainedMarks: 4.0,
      percentage: 100.0,
      accuracy: 100.0,
      totalQuestions: 2,
      correctCount: 2,
      incorrectCount: 0,
      unattemptedCount: 0,
      timeTakenSeconds: 320,
      submittedAt: '2026-11-05T20:05:20Z',
      questions: [
        {
          questionId: 1,
          questionText: 'What is the primary role of an index in MySQL?',
          explanation: 'B-tree index enables log(N) lookups.',
          marksAwarded: 2.0,
          position: 1,
          studentSelectedOptionId: 11,
          correctOptionId: 11,
          isCorrect: true,
          options: [
            { id: 11, optionText: 'To speed up data retrieval operations', position: 1, isCorrect: true },
            { id: 12, optionText: 'To encrypt sensitive data columns', position: 2, isCorrect: false }
          ]
        }
      ]
    };

    it('renders scorecard, metrics, and question review with explanation', async () => {
      resultService.getResult.mockResolvedValue({ data: mockResultData });

      render(
        <MemoryRouter initialEntries={['/app/attempts/101/result']}>
          <Routes>
            <Route path="/app/attempts/:id/result" element={<ResultDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Passed Examination')).toBeInTheDocument();
      });

      expect(screen.getByText('Question-by-Question Review')).toBeInTheDocument();
      expect(screen.getByText('What is the primary role of an index in MySQL?')).toBeInTheDocument();
      expect(screen.getByText('B-tree index enables log(N) lookups.')).toBeInTheDocument();
      expect(screen.getByText('Correct Answer')).toBeInTheDocument();
    });
  });

  describe('MyAttempts Component', () => {
    const mockAttemptsResponse = {
      content: [
        {
          attemptId: 101,
          quizId: 5,
          quizTitle: 'Full-Stack Engineering Exam',
          categoryName: 'Computer Science',
          status: 'SUBMITTED',
          totalMarks: 4.0,
          obtainedMarks: 4.0,
          percentage: 100.0,
          accuracy: 100.0,
          timeTakenSeconds: 320,
          submittedAt: '2026-11-05T20:05:20Z'
        }
      ],
      totalPages: 1,
      totalElements: 1,
      number: 0
    };

    it('renders paginated past attempts and view result link', async () => {
      resultService.getMyAttempts.mockResolvedValue({ data: mockAttemptsResponse });

      render(
        <MemoryRouter>
          <MyAttempts />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Full-Stack Engineering Exam')).toBeInTheDocument();
      });

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText(/View Result/i)).toBeInTheDocument();
    });
  });

  describe('Performance Component', () => {
    const mockPerformance = {
      totalAttempts: 3,
      averagePercentage: 88.5,
      overallAccuracy: 92.0,
      totalQuestionsAttempted: 15,
      categoryMastery: [
        {
          categoryId: 1,
          categoryName: 'Java Programming',
          attemptsCount: 2,
          averageScore: 90.0,
          accuracy: 94.0
        }
      ],
      scoreTrends: [
        {
          attemptId: 101,
          quizTitle: 'Full-Stack Engineering Exam',
          percentage: 100.0,
          date: '2026-11-05'
        }
      ]
    };

    it('renders KPI metrics and category mastery progress', async () => {
      resultService.getPerformance.mockResolvedValue({ data: mockPerformance });

      render(
        <MemoryRouter>
          <Performance />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('88.5%')).toBeInTheDocument();
      });

      expect(screen.getByText('92.0%')).toBeInTheDocument();
      expect(screen.getByText('Java Programming')).toBeInTheDocument();
      expect(screen.getByText('90% avg')).toBeInTheDocument();
      expect(screen.getByText('Recent Attempt Trends')).toBeInTheDocument();
    });
  });

  describe('AdminResults Component', () => {
    const mockAdminResults = {
      data: {
        content: [
          {
            resultId: 50,
            attemptId: 101,
            studentName: 'Alice Johnson',
            studentEmail: 'alice@examadda.test',
            quizTitle: 'Full-Stack Engineering Exam',
            categoryName: 'Computer Science',
            status: 'SUBMITTED',
            totalMarks: 4.0,
            obtainedMarks: 4.0,
            percentage: 100.0,
            accuracy: 100.0,
            timeTakenSeconds: 320,
            submittedAt: '2026-11-05T20:05:20Z'
          }
        ],
        totalPages: 1,
        totalElements: 1,
        number: 0
      }
    };

    it('renders admin results table with student scores and statuses', async () => {
      quizService.getQuizzes.mockResolvedValue({ data: { data: { content: [] } } });
      resultService.getAdminResults.mockResolvedValue(mockAdminResults);

      render(
        <MemoryRouter>
          <AdminResults />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      expect(screen.getByText('alice@examadda.test')).toBeInTheDocument();
      expect(screen.getByText('Full-Stack Engineering Exam')).toBeInTheDocument();
      expect(screen.getAllByText('100.0%').length).toBeGreaterThanOrEqual(1);
    });
  });
});
