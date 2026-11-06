import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminQuizzes from '../src/pages/admin/AdminQuizzes';
import { ToastProvider } from '../src/context/ToastContext';
import quizService from '../src/services/quizService';
import categoryService from '../src/services/categoryService';
import questionService from '../src/services/questionService';

vi.mock('../src/services/quizService');
vi.mock('../src/services/categoryService');
vi.mock('../src/services/questionService');

const mockCategories = [
  { id: 1, name: 'Java Programming' },
  { id: 2, name: 'Data Structures' },
];

const mockQuizzes = [
  {
    id: 1,
    title: 'Java Masterclass Exam',
    categoryName: 'Java Programming',
    difficulty: 'MEDIUM',
    durationMinutes: 45,
    marksPerQuestion: 4.0,
    negativeMarks: 1.0,
    totalMarks: 20.0,
    questionCount: 5,
    status: 'PUBLISHED',
    hasAttempts: false,
  },
  {
    id: 2,
    title: 'Binary Trees Evaluation',
    categoryName: 'Data Structures',
    difficulty: 'HARD',
    durationMinutes: 60,
    marksPerQuestion: 5.0,
    negativeMarks: 1.0,
    totalMarks: 0.0,
    questionCount: 0,
    status: 'DRAFT',
    hasAttempts: false,
  },
];

const mockQuizDetail = {
  id: 1,
  categoryId: 1,
  categoryName: 'Java Programming',
  title: 'Java Masterclass Exam',
  difficulty: 'MEDIUM',
  durationMinutes: 45,
  marksPerQuestion: 4.0,
  negativeMarks: 1.0,
  totalMarks: 20.0,
  status: 'PUBLISHED',
  hasAttempts: false,
  questions: [
    {
      questionId: 101,
      position: 1,
      text: 'What is polymorphism?',
      difficulty: 'MEDIUM',
      subjectName: 'Core Java',
      effectiveMarks: 4.0,
    },
    {
      questionId: 102,
      position: 2,
      text: 'Explain garbage collection.',
      difficulty: 'HARD',
      subjectName: 'Core Java',
      effectiveMarks: 4.0,
    },
  ],
};

describe('AdminQuizzes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.getAdminCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });
    quizService.getQuizzes.mockResolvedValue({
      success: true,
      data: {
        content: mockQuizzes,
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      },
    });
    quizService.getQuizById.mockResolvedValue({
      success: true,
      data: mockQuizDetail,
    });
    questionService.getQuestions.mockResolvedValue({
      success: true,
      data: {
        content: [],
        totalElements: 0,
      },
    });
  });

  it('renders quizzes list and status badges', async () => {
    render(
      <ToastProvider>
        <AdminQuizzes />
      </ToastProvider>
    );

    expect(screen.getByText('Quiz Management')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Java Masterclass Exam')).toBeInTheDocument();
      expect(screen.getByText('Binary Trees Evaluation')).toBeInTheDocument();
      expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });
  });

  it('filters quizzes via search input', async () => {
    render(
      <ToastProvider>
        <AdminQuizzes />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Java Masterclass Exam')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search quizzes by title...');
    fireEvent.change(searchInput, { target: { value: 'Masterclass' } });

    expect(quizService.getQuizzes).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'Masterclass' })
    );
  });

  it('opens Create Quiz modal with form inputs', async () => {
    render(
      <ToastProvider>
        <AdminQuizzes />
      </ToastProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create quiz/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Create New Quiz' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Java Masterclass Examination')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Create New Quiz' })).not.toBeInTheDocument();
    });
  });

  it('opens Quiz Builder for existing quiz and views assigned questions', async () => {
    render(
      <ToastProvider>
        <AdminQuizzes />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Java Masterclass Exam')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByTitle('Open Quiz Builder');
    fireEvent.click(editBtns[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Quiz Builder: Java Masterclass Exam/i })).toBeInTheDocument();
    });

    // Switch to Questions tab
    const questionsTabBtn = screen.getByRole('button', { name: /2\. Assigned Questions/i });
    fireEvent.click(questionsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
      expect(screen.getByText('Explain garbage collection.')).toBeInTheDocument();
    });
  });
});
