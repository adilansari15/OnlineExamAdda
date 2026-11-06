import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/context/ToastContext';
import quizService from '@/services/quizService';
import categoryService from '@/services/categoryService';
import questionService from '@/services/questionService';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  FileCheck2,
  ArrowUp,
  ArrowDown,
  Layers,
  Clock,
  Award,
  Lock,
  Globe,
  Archive
} from 'lucide-react';

const INITIAL_QUIZ_FORM = {
  categoryId: '',
  title: '',
  description: '',
  instructions: '',
  difficulty: 'MEDIUM',
  durationMinutes: 30,
  marksPerQuestion: 4.0,
  negativeMarks: 1.0,
  passingMarks: '',
  maxAttempts: '',
  startAt: '',
  endAt: '',
};

export default function AdminQuizzes() {
  const { success: toastSuccess, error: toastError } = useToast();

  // Data states
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  // Quiz Builder Modal (Create / Edit)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTab, setBuilderTab] = useState('settings'); // 'settings' | 'questions'
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [activeQuizDetail, setActiveQuizDetail] = useState(null);
  const [quizForm, setQuizForm] = useState(INITIAL_QUIZ_FORM);
  const [builderSubmitting, setBuilderSubmitting] = useState(false);
  const [builderError, setBuilderError] = useState(null);

  // Question Assignment State
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuestions, setPickerQuestions] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState([]);

  // Delete Dialog
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getAdminCategories();
        setCategories(res.data || []);
      } catch {
        // Silently handle
      }
    }
    loadCategories();
  }, []);

  // Load Quizzes
  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizService.getQuizzes({
        q: search.trim() || undefined,
        categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        difficulty: selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
        page,
        size: 10,
        sort: 'id,desc',
      });

      const pageData = response.data;
      setQuizzes(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId, selectedStatus, selectedDifficulty, page]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Open Create Quiz Builder
  const handleOpenCreateQuiz = () => {
    setEditingQuizId(null);
    setActiveQuizDetail(null);
    setQuizForm({
      ...INITIAL_QUIZ_FORM,
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setAssignedQuestions([]);
    setBuilderTab('settings');
    setBuilderError(null);
    setIsBuilderOpen(true);
  };

  // Open Edit Quiz Builder
  const handleOpenEditQuiz = async (quiz) => {
    setEditingQuizId(quiz.id);
    setBuilderTab('settings');
    setBuilderError(null);
    setIsBuilderOpen(true);

    try {
      const res = await quizService.getQuizById(quiz.id);
      const detail = res.data;
      setActiveQuizDetail(detail);

      setQuizForm({
        categoryId: detail.categoryId,
        title: detail.title,
        description: detail.description || '',
        instructions: detail.instructions || '',
        difficulty: detail.difficulty,
        durationMinutes: detail.durationMinutes,
        marksPerQuestion: detail.marksPerQuestion,
        negativeMarks: detail.negativeMarks || 0,
        passingMarks: detail.passingMarks !== null ? detail.passingMarks : '',
        maxAttempts: detail.maxAttempts !== null ? detail.maxAttempts : '',
        startAt: detail.startAt ? detail.startAt.slice(0, 16) : '',
        endAt: detail.endAt ? detail.endAt.slice(0, 16) : '',
      });

      setAssignedQuestions(detail.questions || []);
    } catch (err) {
      setBuilderError(err.message || 'Failed to fetch quiz details');
    }
  };

  // Submit Settings Form
  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) {
      setBuilderError('Quiz title is required');
      return;
    }
    if (!quizForm.categoryId) {
      setBuilderError('Please select a category');
      return;
    }

    setBuilderSubmitting(true);
    setBuilderError(null);

    try {
      const payload = {
        categoryId: Number(quizForm.categoryId),
        title: quizForm.title.trim(),
        description: quizForm.description.trim() || null,
        instructions: quizForm.instructions.trim() || null,
        difficulty: quizForm.difficulty,
        durationMinutes: Number(quizForm.durationMinutes),
        marksPerQuestion: Number(quizForm.marksPerQuestion),
        negativeMarks: Number(quizForm.negativeMarks || 0),
        passingMarks: quizForm.passingMarks !== '' ? Number(quizForm.passingMarks) : null,
        maxAttempts: quizForm.maxAttempts !== '' ? Number(quizForm.maxAttempts) : null,
        startAt: quizForm.startAt ? new Date(quizForm.startAt).toISOString() : null,
        endAt: quizForm.endAt ? new Date(quizForm.endAt).toISOString() : null,
      };

      let savedQuiz;
      if (editingQuizId) {
        const res = await quizService.updateQuiz(editingQuizId, payload);
        savedQuiz = res.data;
        toastSuccess('Quiz settings updated successfully');
      } else {
        const res = await quizService.createQuiz(payload);
        savedQuiz = res.data;
        setEditingQuizId(savedQuiz.id);
        toastSuccess('Quiz created successfully. Now assign questions.');
        setBuilderTab('questions');
      }

      setActiveQuizDetail(savedQuiz);
      await loadQuizzes();
    } catch (err) {
      setBuilderError(err.message || 'Failed to save quiz settings');
    } finally {
      setBuilderSubmitting(false);
    }
  };

  // --- QUESTION ASSIGNMENT LOGIC ---
  const handleMoveQuestion = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= assignedQuestions.length) return;

    const updated = [...assignedQuestions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Update positions
    const reindexed = updated.map((q, idx) => ({ ...q, position: idx + 1 }));
    setAssignedQuestions(reindexed);
  };

  const handleRemoveQuestion = (index) => {
    const updated = assignedQuestions.filter((_, idx) => idx !== index);
    const reindexed = updated.map((q, idx) => ({ ...q, position: idx + 1 }));
    setAssignedQuestions(reindexed);
  };

  const handleSaveQuestions = async () => {
    if (!editingQuizId) return;

    setBuilderSubmitting(true);
    setBuilderError(null);

    try {
      const payload = {
        questions: assignedQuestions.map((q) => ({
          questionId: q.questionId,
          marksOverride: q.marksOverride || null,
          negativeOverride: q.negativeOverride || null,
        })),
      };

      const res = await quizService.assignQuestions(editingQuizId, payload);
      setActiveQuizDetail(res.data);
      setAssignedQuestions(res.data.questions || []);
      toastSuccess('Questions assigned successfully');
      await loadQuizzes();
    } catch (err) {
      setBuilderError(err.message || 'Failed to assign questions');
    } finally {
      setBuilderSubmitting(false);
    }
  };

  // --- BANK PICKER MODAL ---
  const handleOpenBankPicker = async () => {
    setIsPickerOpen(true);
    setPickerLoading(true);
    setSelectedBankQuestionIds([]);
    try {
      const res = await questionService.getQuestions({ size: 50 });
      setPickerQuestions(res.data?.content || []);
    } catch (err) {
      toastError(err.message || 'Failed to fetch question bank');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleToggleBankQuestion = (id) => {
    if (selectedBankQuestionIds.includes(id)) {
      setSelectedBankQuestionIds(selectedBankQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedBankQuestionIds([...selectedBankQuestionIds, id]);
    }
  };

  const handleConfirmAddFromBank = () => {
    const currentQuestionIds = new Set(assignedQuestions.map((q) => q.questionId));
    const newlySelected = pickerQuestions.filter(
      (q) => selectedBankQuestionIds.includes(q.id) && !currentQuestionIds.has(q.id)
    );

    const newlyAssigned = newlySelected.map((q, idx) => ({
      questionId: q.id,
      position: assignedQuestions.length + idx + 1,
      text: q.text,
      difficulty: q.difficulty,
      subjectName: q.subjectName,
      effectiveMarks: activeQuizDetail?.marksPerQuestion || 4.0,
      effectiveNegativeMarks: activeQuizDetail?.negativeMarks || 1.0,
    }));

    setAssignedQuestions([...assignedQuestions, ...newlyAssigned]);
    setIsPickerOpen(false);
  };

  // --- PUBLISH / UNPUBLISH ---
  const handlePublishToggle = async (quiz) => {
    try {
      if (quiz.status === 'PUBLISHED') {
        const res = await quizService.unpublishQuiz(quiz.id);
        toastSuccess(`Quiz '${quiz.title}' unpublished (Draft)`);
        if (activeQuizDetail?.id === quiz.id) setActiveQuizDetail(res.data);
      } else {
        const res = await quizService.publishQuiz(quiz.id);
        toastSuccess(`Quiz '${quiz.title}' published successfully!`);
        if (activeQuizDetail?.id === quiz.id) setActiveQuizDetail(res.data);
      }
      await loadQuizzes();
    } catch (err) {
      toastError(err.message || 'Failed to update quiz status');
    }
  };

  // --- DELETE QUIZ ---
  const handleConfirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await quizService.deleteQuiz(quizToDelete.id);
      toastSuccess(`Quiz '${quizToDelete.title}' deleted successfully`);
      setQuizToDelete(null);
      await loadQuizzes();
    } catch (err) {
      toastError(err.message || 'Cannot delete quiz');
      setQuizToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Bank Questions
  const filteredBankQuestions = useMemo(() => {
    if (!pickerSearch.trim()) return pickerQuestions;
    const q = pickerSearch.toLowerCase();
    return pickerQuestions.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q)
    );
  }, [pickerQuestions, pickerSearch]);

  // Live computed total marks
  const computedTotalMarks = useMemo(() => {
    const defaultMarks = Number(quizForm.marksPerQuestion) || 4.0;
    return assignedQuestions.reduce((sum, q) => {
      const marks = q.marksOverride != null ? Number(q.marksOverride) : defaultMarks;
      return sum + marks;
    }, 0);
  }, [assignedQuestions, quizForm.marksPerQuestion]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quiz Management"
        subtitle="Create, configure, schedule, and publish examination assessments"
        actions={
          <Button
            variant="accent"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleOpenCreateQuiz}
          >
            Create Quiz
          </Button>
        }
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-text">{totalElements}</div>
          <div className="text-xs text-muted">Total Quizzes</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="text-2xl font-bold text-success">
            {quizzes.filter((q) => q.status === 'PUBLISHED').length}
          </div>
          <div className="text-xs text-muted">Published on Page</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-border">
          <div className="text-2xl font-bold text-text">
            {quizzes.filter((q) => q.status === 'DRAFT').length}
          </div>
          <div className="text-xs text-muted">Drafts on Page</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-accent">
          <div className="text-2xl font-bold text-accent">
            {quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0)}
          </div>
          <div className="text-xs text-muted">Questions Assigned</div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search quizzes by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            leftIcon={<Search className="h-4 w-4 text-muted" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="w-48">
            <Select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Status Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setSelectedStatus(st);
                  setPage(0);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Difficulty Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setSelectedDifficulty(diff);
                  setPage(0);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                {diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ) : error ? (
        <ErrorState
          title="Could not load quizzes"
          message={error}
          onRetry={loadQuizzes}
        />
      ) : quizzes.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<FileCheck2 className="h-10 w-10 text-muted" />}
            title="No quizzes found"
            message={
              search || selectedCategoryId || selectedStatus !== 'ALL' || selectedDifficulty !== 'ALL'
                ? 'No quizzes match your current search and filters.'
                : 'No examinations or quizzes have been created yet.'
            }
            action={
              search || selectedCategoryId || selectedStatus !== 'ALL' || selectedDifficulty !== 'ALL' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategoryId('');
                    setSelectedStatus('ALL');
                    setSelectedDifficulty('ALL');
                    setPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="accent" size="sm" onClick={handleOpenCreateQuiz}>
                  Create First Quiz
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 border-b border-border text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Quiz Title</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Difficulty</th>
                  <th className="py-3 px-4 font-medium">Questions</th>
                  <th className="py-3 px-4 font-medium">Duration & Marks</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-text text-sm flex items-center gap-1.5">
                        <span>{q.title}</span>
                        {q.hasAttempts && (
                          <span title="Locked: Quiz has student attempts">
                            <Lock className="h-3.5 w-3.5 text-warning" />
                          </span>
                        )}
                      </div>
                      {q.description && (
                        <div className="text-muted text-[11px] line-clamp-1 mt-0.5">
                          {q.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted">{q.categoryName}</td>
                    <td className="py-3.5 px-4">
                      <Badge difficulty={q.difficulty} />
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuiz(q)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-3 text-text font-medium text-xs border border-border transition-colors cursor-pointer"
                        title="Configure assigned questions"
                      >
                        <Layers className="h-3.5 w-3.5 text-accent" />
                        <span>{q.questionCount || 0} questions</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-text">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3 text-muted" />
                        <span>{q.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                        <Award className="h-3 w-3 text-accent" />
                        <span>{q.totalMarks} total marks</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          q.status === 'PUBLISHED'
                            ? 'success'
                            : q.status === 'ARCHIVED'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {q.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEditQuiz(q)}
                          title="Open Quiz Builder"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            q.status === 'PUBLISHED'
                              ? 'text-warning hover:bg-warning/10'
                              : 'text-success hover:bg-success/10'
                          }`}
                          onClick={() => handlePublishToggle(q)}
                          title={q.status === 'PUBLISHED' ? 'Unpublish Quiz' : 'Publish Quiz'}
                        >
                          {q.status === 'PUBLISHED' ? (
                            <Archive className="h-4 w-4" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-error hover:bg-error/10 hover:text-error"
                          onClick={() => setQuizToDelete(q)}
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 border-t border-border">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </Card>
      )}

      {/* QUIZ BUILDER MODAL (TABBED) */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title={editingQuizId ? `Quiz Builder: ${activeQuizDetail?.title || 'Edit'}` : 'Create New Quiz'}
        description="Configure exam settings, schedule windows, and assigned questions"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 mt-2">
          {/* Builder Alert Notification */}
          {builderError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{builderError}</span>
            </div>
          )}

          {activeQuizDetail?.hasAttempts && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                <strong>Quiz Locked:</strong> This quiz has student attempts recorded. Question set, answer keys, and marking parameters cannot be modified.
              </span>
            </div>
          )}

          {/* Builder Tabs */}
          <div className="flex border-b border-border gap-4">
            <button
              type="button"
              onClick={() => setBuilderTab('settings')}
              className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                builderTab === 'settings'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              1. Quiz Settings
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editingQuizId) {
                  toastError('Please save quiz settings first before assigning questions');
                  return;
                }
                setBuilderTab('questions');
              }}
              className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
                builderTab === 'questions'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              <span>2. Assigned Questions</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-2 text-[10px]">
                {assignedQuestions.length}
              </span>
            </button>
          </div>

          {/* TAB 1: SETTINGS */}
          {builderTab === 'settings' && (
            <form onSubmit={handleSubmitSettings} className="space-y-4">
              <div>
                <Input
                  label="Quiz Title *"
                  placeholder="e.g. Java Masterclass Examination"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Select
                    label="Category *"
                    value={quizForm.categoryId}
                    onChange={(e) => setQuizForm({ ...quizForm, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Select
                    label="Difficulty *"
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                    required
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    label="Duration (minutes) *"
                    type="number"
                    min="1"
                    value={quizForm.durationMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Marks / Question *"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={quizForm.marksPerQuestion}
                    onChange={(e) => setQuizForm({ ...quizForm, marksPerQuestion: e.target.value })}
                    disabled={activeQuizDetail?.hasAttempts}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Negative Marks *"
                    type="number"
                    step="0.25"
                    min="0"
                    value={quizForm.negativeMarks}
                    onChange={(e) => setQuizForm({ ...quizForm, negativeMarks: e.target.value })}
                    disabled={activeQuizDetail?.hasAttempts}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Passing Marks"
                    type="number"
                    step="0.5"
                    placeholder="Optional"
                    value={quizForm.passingMarks}
                    onChange={(e) => setQuizForm({ ...quizForm, passingMarks: e.target.value })}
                  />
                </div>

                <div>
                  <Input
                    label="Max Attempts"
                    type="number"
                    min="1"
                    placeholder="Leave blank for unlimited"
                    value={quizForm.maxAttempts}
                    onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: e.target.value })}
                  />
                </div>
              </div>

              {/* Schedule Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-surface-2/40 border border-border">
                <div>
                  <label className="block text-xs font-medium text-text mb-1">
                    Exam Window Start (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={quizForm.startAt}
                    onChange={(e) => setQuizForm({ ...quizForm, startAt: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text focus-visible:outline-none focus-visible:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text mb-1">
                    Exam Window End (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={quizForm.endAt}
                    onChange={(e) => setQuizForm({ ...quizForm, endAt: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text focus-visible:outline-none focus-visible:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-text">Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Instructions presented to the candidate before starting the examination..."
                  value={quizForm.instructions}
                  onChange={(e) => setQuizForm({ ...quizForm, instructions: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-accent"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                {activeQuizDetail && (
                  <Button
                    type="button"
                    variant={activeQuizDetail.status === 'PUBLISHED' ? 'secondary' : 'accent'}
                    size="sm"
                    onClick={() => handlePublishToggle(activeQuizDetail)}
                  >
                    {activeQuizDetail.status === 'PUBLISHED' ? 'Unpublish Quiz' : 'Publish Quiz'}
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setIsBuilderOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    isLoading={builderSubmitting}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: QUESTION ASSIGNMENT */}
          {builderTab === 'questions' && (
            <div className="space-y-4">
              {/* Question list toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-surface-2 border border-border">
                <div>
                  <div className="text-xs font-semibold text-text">
                    Assigned: {assignedQuestions.length} Questions
                  </div>
                  <div className="text-[11px] text-muted">
                    Total Marks: <strong className="text-accent">{computedTotalMarks.toFixed(1)}</strong>
                  </div>
                </div>

                {!activeQuizDetail?.hasAttempts && (
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={handleOpenBankPicker}
                  >
                    Add From Bank
                  </Button>
                )}
              </div>

              {/* Questions table list */}
              {assignedQuestions.length === 0 ? (
                <div className="py-12 text-center text-muted text-xs border border-dashed border-border rounded-lg">
                  No questions assigned to this quiz yet. Click &quot;Add From Bank&quot; to pick questions.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {assignedQuestions.map((q, idx) => (
                    <div
                      key={q.questionId}
                      className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-text truncate">{q.text}</p>
                          <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                            <Badge difficulty={q.difficulty} size="sm" />
                            <span>{q.subjectName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reorder and Delete Actions */}
                      {!activeQuizDetail?.hasAttempts && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(idx, -1)}
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={idx === assignedQuestions.length - 1}
                            onClick={() => handleMoveQuestion(idx, 1)}
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-error hover:bg-error/10 hover:text-error"
                            onClick={() => handleRemoveQuestion(idx)}
                            title="Remove Question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                {activeQuizDetail && (
                  <Button
                    type="button"
                    variant={activeQuizDetail.status === 'PUBLISHED' ? 'secondary' : 'accent'}
                    size="sm"
                    onClick={() => handlePublishToggle(activeQuizDetail)}
                  >
                    {activeQuizDetail.status === 'PUBLISHED' ? 'Unpublish Quiz' : 'Publish Quiz'}
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsBuilderOpen(false)}
                  >
                    Close
                  </Button>
                  {!activeQuizDetail?.hasAttempts && (
                    <Button
                      variant="accent"
                      size="md"
                      isLoading={builderSubmitting}
                      onClick={handleSaveQuestions}
                    >
                      Save Assigned Questions
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* QUESTION PICKER MODAL */}
      <Modal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title="Add Questions from Question Bank"
        description="Select questions to include into this examination"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 mt-2">
          {/* Picker Search */}
          <div className="relative">
            <Input
              placeholder="Filter bank questions..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted" />}
            />
          </div>

          {/* Questions Picker List */}
          {pickerLoading ? (
            <div className="py-8 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredBankQuestions.length === 0 ? (
            <div className="py-8 text-center text-muted text-xs border border-dashed border-border rounded-lg">
              No questions found in bank.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
              {filteredBankQuestions.map((q) => {
                const isSelected = selectedBankQuestionIds.includes(q.id);
                const isAlreadyAssigned = assignedQuestions.some(
                  (aq) => aq.questionId === q.id
                );

                return (
                  <div
                    key={q.id}
                    onClick={() => !isAlreadyAssigned && handleToggleBankQuestion(q.id)}
                    className={`p-2.5 rounded-md border flex items-center gap-3 text-xs cursor-pointer transition-colors ${
                      isAlreadyAssigned
                        ? 'opacity-40 cursor-not-allowed bg-surface-2 border-border'
                        : isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-surface hover:bg-surface-2/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected || isAlreadyAssigned}
                      disabled={isAlreadyAssigned}
                      onChange={() => {}}
                      className="h-4 w-4 text-accent rounded border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate">{q.text}</p>
                      <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                        <Badge difficulty={q.difficulty} size="sm" />
                        <span>{q.subjectName}</span>
                        {isAlreadyAssigned && (
                          <span className="text-warning font-semibold">• Already Assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsPickerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={handleConfirmAddFromBank}
              disabled={selectedBankQuestionIds.length === 0}
            >
              Add Selected ({selectedBankQuestionIds.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(quizToDelete)}
        onClose={() => setQuizToDelete(null)}
        onConfirm={handleConfirmDeleteQuiz}
        title="Delete Quiz"
        message={`Are you sure you want to delete '${quizToDelete?.title}'? Deletion is permanently blocked if student attempts have already been started or submitted for this quiz.`}
        confirmText="Delete Quiz"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
