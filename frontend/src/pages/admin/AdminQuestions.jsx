import { useState, useEffect, useCallback } from 'react';
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
import questionService from '@/services/questionService';
import categoryService from '@/services/categoryService';
import {
  Plus,
  Search,
  HelpCircle,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Check
} from 'lucide-react';

const INITIAL_FORM = {
  subjectId: '',
  text: '',
  explanation: '',
  difficulty: 'MEDIUM',
  active: true,
  options: [
    { optionText: '', isCorrect: true, position: 1 },
    { optionText: '', isCorrect: false, position: 2 },
    { optionText: '', isCorrect: false, position: 3 },
    { optionText: '', isCorrect: false, position: 4 },
  ],
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function AdminQuestions() {
  const { success: toastSuccess, error: toastError } = useToast();

  // Data states
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  // Question Form Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Preview Dialog
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Delete Dialog
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch subjects for dropdown filter and creation
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await categoryService.getAdminSubjects();
        setSubjects(res.data || []);
      } catch {
        // Silently handle subject loading error
      }
    }
    loadSubjects();
  }, []);

  // Fetch paginated questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionService.getQuestions({
        q: search.trim() || undefined,
        subjectId: selectedSubjectId ? Number(selectedSubjectId) : undefined,
        difficulty: selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
        page,
        size: 10,
        sort: 'id,desc',
      });

      const pageData = response.data;
      setQuestions(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Failed to load question bank');
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubjectId, selectedDifficulty, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Handle Search Input Change (resets to page 0)
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Handle Filter Change
  const handleSubjectFilterChange = (e) => {
    setSelectedSubjectId(e.target.value);
    setPage(0);
  };

  const handleDifficultyFilterChange = (diff) => {
    setSelectedDifficulty(diff);
    setPage(0);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setForm({
      ...INITIAL_FORM,
      subjectId: subjects.length > 0 ? subjects[0].id : '',
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    const mappedOptions = q.options.map((opt, idx) => ({
      id: opt.id,
      optionText: opt.optionText,
      isCorrect: opt.isCorrect,
      position: opt.position || idx + 1,
    }));

    setForm({
      subjectId: q.subjectId,
      text: q.text,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      active: q.active,
      options: mappedOptions,
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Change which option is marked correct (radio selection)
  const handleSetCorrectOption = (index) => {
    const updatedOptions = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setForm({ ...form, options: updatedOptions });
  };

  // Change option text
  const handleOptionTextChange = (index, value) => {
    const updatedOptions = [...form.options];
    updatedOptions[index] = { ...updatedOptions[index], optionText: value };
    setForm({ ...form, options: updatedOptions });
  };

  // Submit Question Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      setFormError('Question text is required');
      return;
    }
    if (!form.subjectId) {
      setFormError('Please select a subject');
      return;
    }

    const hasEmptyOption = form.options.some((o) => !o.optionText.trim());
    if (hasEmptyOption) {
      setFormError('All 4 option fields must be filled');
      return;
    }

    const correctCount = form.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      setFormError('Exactly 1 option must be selected as correct');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        subjectId: Number(form.subjectId),
        text: form.text.trim(),
        explanation: form.explanation.trim() || null,
        difficulty: form.difficulty,
        active: form.active,
        options: form.options.map((opt, i) => ({
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          position: i + 1,
        })),
      };

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, payload);
        toastSuccess('Question updated successfully');
      } else {
        await questionService.createQuestion(payload);
        toastSuccess('Question created successfully');
      }

      setIsFormModalOpen(false);
      await loadQuestions();
    } catch (err) {
      setFormError(err.message || 'Failed to save question');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Question
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await questionService.deleteQuestion(questionToDelete.id);
      toastSuccess('Question deleted successfully');
      setQuestionToDelete(null);
      await loadQuestions();
    } catch (err) {
      toastError(err.message || 'Cannot delete question');
      setQuestionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Question Bank"
        subtitle="Manage questions, multiple choice options, explanations, and difficulty ratings"
        actions={
          <Button
            variant="accent"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleOpenCreate}
          >
            Add Question
          </Button>
        }
      />

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-text">{totalElements}</div>
          <div className="text-xs text-muted">Total Questions</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="text-2xl font-bold text-success">
            {questions.filter((q) => q.difficulty === 'EASY').length}
          </div>
          <div className="text-xs text-muted">Easy on Page</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-warning">
          <div className="text-2xl font-bold text-warning">
            {questions.filter((q) => q.difficulty === 'MEDIUM').length}
          </div>
          <div className="text-xs text-muted">Medium on Page</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-error">
          <div className="text-2xl font-bold text-error">
            {questions.filter((q) => q.difficulty === 'HARD').length}
          </div>
          <div className="text-xs text-muted">Hard on Page</div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search questions by text..."
            value={search}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4 text-muted" />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="w-48">
            <Select
              value={selectedSubjectId}
              onChange={handleSubjectFilterChange}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Difficulty Filter Chips */}
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => handleDifficultyFilterChange(diff)}
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

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ) : error ? (
        <ErrorState
          title="Could not load question bank"
          message={error}
          onRetry={loadQuestions}
        />
      ) : questions.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<FileQuestion className="h-10 w-10 text-muted" />}
            title="No questions found"
            message={
              search || selectedSubjectId || selectedDifficulty !== 'ALL'
                ? 'No questions match the current search or filters.'
                : 'Your question bank is empty. Create your first question to get started.'
            }
            action={
              search || selectedSubjectId || selectedDifficulty !== 'ALL' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedSubjectId('');
                    setSelectedDifficulty('ALL');
                    setPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="accent" size="sm" onClick={handleOpenCreate}>
                  Add First Question
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
                  <th className="py-3 px-4 font-medium w-1/2">Question</th>
                  <th className="py-3 px-4 font-medium">Subject</th>
                  <th className="py-3 px-4 font-medium">Difficulty</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text text-sm line-clamp-2 leading-snug">
                        {q.text}
                      </div>
                      <div className="text-[11px] text-muted mt-1 flex items-center gap-2">
                        <span>4 options</span>
                        {q.explanation && (
                          <>
                            <span>•</span>
                            <span className="text-accent/90">Has explanation</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text">
                      <div className="font-medium">{q.subjectName}</div>
                      <div className="text-muted text-[11px]">{q.categoryName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge difficulty={q.difficulty} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={q.active ? 'success' : 'neutral'}>
                        {q.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPreviewQuestion(q)}
                          title="Preview Question"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEdit(q)}
                          title="Edit Question"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-error hover:bg-error/10 hover:text-error"
                          onClick={() => setQuestionToDelete(q)}
                          title="Delete Question"
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

          {/* Pagination */}
          <div className="px-4 border-t border-border">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </Card>
      )}

      {/* CREATE / EDIT QUESTION MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        description="Provide 4 multiple choice options with exactly 1 marked as correct"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 mt-2">
          {formError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Subject & Difficulty Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select
                label="Subject *"
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                required
              >
                <option value="">Select a Subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.categoryName})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Difficulty *"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                required
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </Select>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-text">Question Text *</label>
            <textarea
              rows={3}
              placeholder="Enter the problem statement or question here..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-accent"
              required
            />
          </div>

          {/* 4 Options with Radio Selector */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Options (Exactly 4 Options — Mark 1 Correct)
              </label>
              <span className="text-[11px] text-muted">Radio indicates correct option</span>
            </div>

            <div className="space-y-2.5">
              {form.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                    opt.isCorrect
                      ? 'border-success/40 bg-success/5'
                      : 'border-border bg-surface-2/30'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => handleSetCorrectOption(idx)}
                      className="h-4 w-4 text-success focus:ring-success border-border cursor-pointer"
                    />
                    <span className="font-bold text-xs text-text w-4">
                      {OPTION_LABELS[idx]}
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder={`Option ${OPTION_LABELS[idx]} text`}
                    value={opt.optionText}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-accent"
                    required
                  />

                  {opt.isCorrect && (
                    <Badge variant="success" size="sm" className="shrink-0">
                      <Check className="h-3 w-3" /> Correct
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Field */}
          <div className="space-y-1.5 text-left pt-2 border-t border-border">
            <label className="block text-xs font-medium text-text">Explanation (Optional)</label>
            <textarea
              rows={2}
              placeholder="Explain why the selected option is correct. Shown to students after submission."
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-accent"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="questionActive"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="questionActive" className="text-xs text-text cursor-pointer">
              Active (Eligible for quiz assignment)
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={formSubmitting}
            >
              {editingQuestion ? 'Save Changes' : 'Create Question'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* QUESTION PREVIEW DIALOG */}
      <Modal
        isOpen={Boolean(previewQuestion)}
        onClose={() => setPreviewQuestion(null)}
        title="Question Preview"
        description="Review question presentation and answer key"
        maxWidth="max-w-xl"
      >
        {previewQuestion && (
          <div className="space-y-4 mt-2">
            {/* Metadata Badges */}
            <div className="flex items-center gap-2">
              <Badge difficulty={previewQuestion.difficulty} />
              <Badge variant="default">{previewQuestion.subjectName}</Badge>
              <Badge variant={previewQuestion.active ? 'success' : 'neutral'}>
                {previewQuestion.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-lg bg-surface-2 border border-border">
              <h3 className="text-sm font-semibold text-text leading-relaxed">
                {previewQuestion.text}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted uppercase tracking-wider">
                Multiple Choice Options
              </h4>
              <div className="space-y-2">
                {previewQuestion.options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-xs transition-colors ${
                      opt.isCorrect
                        ? 'border-success bg-success/10 text-text font-medium'
                        : 'border-border bg-surface text-muted'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-bold text-[11px] ${
                        opt.isCorrect
                          ? 'bg-success text-white'
                          : 'bg-surface-3 text-muted'
                      }`}
                    >
                      {OPTION_LABELS[idx]}
                    </span>
                    <span className="flex-1 mt-0.5">{opt.optionText}</span>
                    {opt.isCorrect && (
                      <span className="inline-flex items-center gap-1 text-success font-semibold shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {previewQuestion.explanation && (
              <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/20 space-y-1">
                <div className="flex items-center gap-1.5 text-accent text-xs font-semibold">
                  <HelpCircle className="h-4 w-4" /> Explanation
                </div>
                <p className="text-xs text-text leading-relaxed">
                  {previewQuestion.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setPreviewQuestion(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(questionToDelete)}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message={`Are you sure you want to delete this question: "${questionToDelete?.text}"? Deletion is blocked if the question is used in quizzes that have attempts.`}
        confirmText="Delete Question"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
