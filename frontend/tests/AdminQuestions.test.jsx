import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminQuestions from '../src/pages/admin/AdminQuestions';
import { ToastProvider } from '../src/context/ToastContext';
import questionService from '../src/services/questionService';
import categoryService from '../src/services/categoryService';

vi.mock('../src/services/questionService');
vi.mock('../src/services/categoryService');

const mockSubjects = [
  { id: 1, name: 'Core Java', categoryName: 'Java Programming' },
  { id: 2, name: 'Operating Systems', categoryName: 'CS Core' },
];

const mockQuestions = [
  {
    id: 101,
    subjectId: 1,
    subjectName: 'Core Java',
    categoryId: 1,
    categoryName: 'Java Programming',
    text: 'What is the default value of boolean in Java?',
    explanation: 'Booleans default to false in instance variables.',
    difficulty: 'EASY',
    active: true,
    options: [
      { id: 1, optionText: 'true', isCorrect: false, position: 1 },
      { id: 2, optionText: 'false', isCorrect: true, position: 2 },
      { id: 3, optionText: 'null', isCorrect: false, position: 3 },
      { id: 4, optionText: '0', isCorrect: false, position: 4 },
    ],
  },
  {
    id: 102,
    subjectId: 2,
    subjectName: 'Operating Systems',
    categoryId: 2,
    categoryName: 'CS Core',
    text: 'Explain page fault handling mechanism.',
    explanation: 'Handled via MMU trap.',
    difficulty: 'HARD',
    active: true,
    options: [
      { id: 5, optionText: 'Option 1', isCorrect: true, position: 1 },
      { id: 6, optionText: 'Option 2', isCorrect: false, position: 2 },
      { id: 7, optionText: 'Option 3', isCorrect: false, position: 3 },
      { id: 8, optionText: 'Option 4', isCorrect: false, position: 4 },
    ],
  },
];

describe('AdminQuestions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.getAdminSubjects.mockResolvedValue({
      success: true,
      data: mockSubjects,
    });
    questionService.getQuestions.mockResolvedValue({
      success: true,
      data: {
        content: mockQuestions,
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      },
    });
  });

  it('renders question bank list and statistics', async () => {
    render(
      <ToastProvider>
        <AdminQuestions />
      </ToastProvider>
    );

    expect(screen.getByText('Question Bank')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('What is the default value of boolean in Java?')).toBeInTheDocument();
      expect(screen.getByText('Explain page fault handling mechanism.')).toBeInTheDocument();
      expect(screen.getAllByText('Core Java').length).toBeGreaterThan(0);
    });
  });

  it('filters questions via search input', async () => {
    render(
      <ToastProvider>
        <AdminQuestions />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('What is the default value of boolean in Java?')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search questions by text...');
    fireEvent.change(searchInput, { target: { value: 'boolean' } });

    expect(questionService.getQuestions).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'boolean' })
    );
  });

  it('opens and closes create question modal with 4 options inputs', async () => {
    render(
      <ToastProvider>
        <AdminQuestions />
      </ToastProvider>
    );

    const addQuestionBtn = screen.getByRole('button', { name: /add question/i });
    fireEvent.click(addQuestionBtn);

    expect(screen.getByRole('heading', { name: 'Add New Question' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter the problem statement/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option A text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option B text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option C text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option D text')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add New Question' })).not.toBeInTheDocument();
    });
  });

  it('opens preview dialog and shows correct answer highlight and explanation', async () => {
    render(
      <ToastProvider>
        <AdminQuestions />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('What is the default value of boolean in Java?')).toBeInTheDocument();
    });

    const previewButtons = screen.getAllByTitle('Preview Question');
    fireEvent.click(previewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Question Preview' })).toBeInTheDocument();
      expect(screen.getByText('Correct Answer')).toBeInTheDocument();
      expect(screen.getByText(/booleans default to false/i)).toBeInTheDocument();
    });
  });
});
