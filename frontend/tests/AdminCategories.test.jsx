import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminCategories from '../src/pages/admin/AdminCategories';
import { ToastProvider } from '../src/context/ToastContext';
import categoryService from '../src/services/categoryService';

vi.mock('../src/services/categoryService');

const mockCategories = [
  {
    id: 1,
    name: 'Java Programming',
    slug: 'java-programming',
    description: 'Core and advanced Java topics',
    icon: 'code',
    active: true,
    subjectCount: 4,
  },
  {
    id: 2,
    name: 'Operating Systems',
    slug: 'operating-systems',
    description: 'Kernel, processes, concurrency',
    icon: 'cpu',
    active: false,
    subjectCount: 2,
  },
];

const mockSubjects = [
  {
    id: 10,
    categoryId: 1,
    name: 'Java Multithreading',
    slug: 'java-multithreading',
    description: 'Threads, locks, executors',
    active: true,
    questionCount: 15,
  },
];

describe('AdminCategories Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.getAdminCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });
    categoryService.getAdminSubjects.mockResolvedValue({
      success: true,
      data: mockSubjects,
    });
  });

  it('renders categories list, stats and table', async () => {
    render(
      <ToastProvider>
        <AdminCategories />
      </ToastProvider>
    );

    expect(screen.getByText('Categories & Subjects')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Java Programming')).toBeInTheDocument();
      expect(screen.getByText('Operating Systems')).toBeInTheDocument();
      expect(screen.getByText('4 subjects')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('filters categories using search input', async () => {
    render(
      <ToastProvider>
        <AdminCategories />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Java Programming')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search categories...');
    fireEvent.change(searchInput, { target: { value: 'Operating' } });

    expect(screen.getByText('Operating Systems')).toBeInTheDocument();
    expect(screen.queryByText('Java Programming')).not.toBeInTheDocument();
  });

  it('opens and closes create category modal', async () => {
    render(
      <ToastProvider>
        <AdminCategories />
      </ToastProvider>
    );

    const newCategoryBtn = screen.getByRole('button', { name: /new category/i });
    fireEvent.click(newCategoryBtn);

    expect(screen.getByRole('heading', { name: 'Create Category' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Computer Networks')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Create Category' })).not.toBeInTheDocument();
    });
  });

  it('opens subject management modal and lists subjects', async () => {
    render(
      <ToastProvider>
        <AdminCategories />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Java Programming')).toBeInTheDocument();
    });

    const manageSubjectsBtn = screen.getByRole('button', { name: /4 subjects/i });
    fireEvent.click(manageSubjectsBtn);

    await waitFor(() => {
      expect(screen.getByText(/Subjects: Java Programming/i)).toBeInTheDocument();
      expect(screen.getByText('Java Multithreading')).toBeInTheDocument();
      expect(screen.getByText('java-multithreading')).toBeInTheDocument();
    });
  });
});

