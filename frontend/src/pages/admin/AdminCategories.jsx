

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import categoryService from '@/services/categoryService';
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  FolderTree,
  AlertCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function AdminCategories() {
  const { success: toastSuccess, error: toastError } = useToast();

  // State: Categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Category Modal (Create / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    active: true,
  });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState(null);

  // Category Delete Dialog
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Subjects Management Drawer / Modal
  const [activeCategoryForSubjects, setActiveCategoryForSubjects] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');

  // Subject Modal (Create / Edit)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
    active: true,
  });
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);
  const [subjectFormError, setSubjectFormError] = useState(null);

  // Subject Delete Dialog
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);

  // Fetch categories
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getAdminCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const query = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [categories, search]);

  // Open Create Category Modal
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', icon: '', active: true });
    setCategoryFormError(null);
    setIsCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      active: cat.active !== undefined ? cat.active : true,
    });
    setCategoryFormError(null);
    setIsCategoryModalOpen(true);
  };

  // Submit Category
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setCategoryFormError('Category name is required');
      return;
    }

    setCategorySubmitting(true);
    setCategoryFormError(null);

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryForm);
        toastSuccess('Category updated successfully');
      } else {
        await categoryService.createCategory(categoryForm);
        toastSuccess('Category created successfully');
      }
      setIsCategoryModalOpen(false);
      await loadCategories();
    } catch (err) {
      setCategoryFormError(err.message || 'Operation failed');
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Confirm Delete Category
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toastSuccess(`Category '${categoryToDelete.name}' deleted successfully`);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err) {
      toastError(err.message || 'Failed to delete category');
      setCategoryToDelete(null);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // --- SUBJECTS MANAGEMENT ---
  const loadSubjects = useCallback(async (categoryId) => {
    setSubjectsLoading(true);
    try {
      const response = await categoryService.getAdminSubjects(categoryId);
      setSubjects(response.data || []);
    } catch (err) {
      toastError(err.message || 'Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  }, [toastError]);

  const handleOpenSubjects = (category) => {
    setActiveCategoryForSubjects(category);
    setSubjectSearch('');
    loadSubjects(category.id);
  };

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return subjects;
    const query = subjectSearch.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
    );
  }, [subjects, subjectSearch]);

  const handleOpenCreateSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', description: '', active: true });
    setSubjectFormError(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectForm({
      name: sub.name,
      description: sub.description || '',
      active: sub.active !== undefined ? sub.active : true,
    });
    setSubjectFormError(null);
    setIsSubjectModalOpen(true);
  };

  const handleSubmitSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      setSubjectFormError('Subject name is required');
      return;
    }

    setSubjectSubmitting(true);
    setSubjectFormError(null);

    try {
      const payload = {
        ...subjectForm,
        categoryId: activeCategoryForSubjects.id,
      };

      if (editingSubject) {
        await categoryService.updateSubject(editingSubject.id, payload);
        toastSuccess('Subject updated successfully');
      } else {
        await categoryService.createSubject(payload);
        toastSuccess('Subject created successfully');
      }
      setIsSubjectModalOpen(false);
      await loadSubjects(activeCategoryForSubjects.id);
      await loadCategories();
    } catch (err) {
      setSubjectFormError(err.message || 'Failed to save subject');
    } finally {
      setSubjectSubmitting(false);
    }
  };

  const handleConfirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    setIsDeletingSubject(true);
    try {
      await categoryService.deleteSubject(subjectToDelete.id);
      toastSuccess(`Subject '${subjectToDelete.name}' deleted successfully`);
      setSubjectToDelete(null);
      await loadSubjects(activeCategoryForSubjects.id);
      await loadCategories();
    } catch (err) {
      toastError(err.message || 'Failed to delete subject');
      setSubjectToDelete(null);
    } finally {
      setIsDeletingSubject(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Categories & Subjects"
        subtitle="Organize curriculum taxonomy, subject categorizations, and syllabus hierarchies"
        actions={
          <Button
            variant="accent"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleOpenCreateCategory}
          >
            New Category
          </Button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{categories.length}</div>
            <div className="text-xs text-muted">Total Categories</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">
              {categories.filter((c) => c.active).length}
            </div>
            <div className="text-xs text-muted">Active Categories</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">
              {categories.reduce((acc, c) => acc + (c.subjectCount || 0), 0)}
            </div>
            <div className="text-xs text-muted">Total Associated Subjects</div>
          </div>
        </Card>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted" />}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : error ? (
        <ErrorState
          title="Could not load categories"
          message={error}
          onRetry={loadCategories}
        />
      ) : filteredCategories.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<FolderTree className="h-10 w-10 text-muted" />}
            title="No categories found"
            message={
              search
                ? `No categories match your search "${search}".`
                : 'No curriculum categories have been created yet.'
            }
            action={
              search ? (
                <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              ) : (
                <Button variant="accent" size="sm" onClick={handleOpenCreateCategory}>
                  Create First Category
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
                  <th className="py-3 px-4 font-medium">Category Name</th>
                  <th className="py-3 px-4 font-medium">Slug</th>
                  <th className="py-3 px-4 font-medium">Subjects</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-text text-sm">{cat.name}</div>
                      {cat.description && (
                        <div className="text-muted text-xs line-clamp-1 mt-0.5">
                          {cat.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted font-mono">{cat.slug}</td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleOpenSubjects(cat)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-3 text-text font-medium text-xs border border-border transition-colors cursor-pointer"
                        title="Manage Subjects"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-accent" />
                        <span>{cat.subjectCount || 0} subjects</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={cat.active ? 'success' : 'neutral'}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenSubjects(cat)}
                          title="Manage Subjects"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEditCategory(cat)}
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-error hover:bg-error/10 hover:text-error"
                          onClick={() => setCategoryToDelete(cat)}
                          title="Delete Category"
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
        </Card>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        description="Organize your exams under structured categories"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitCategory} className="space-y-4 mt-2">
          {categoryFormError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{categoryFormError}</span>
            </div>
          )}

          <div>
            <Input
              label="Category Name *"
              placeholder="e.g. Computer Networks"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-text">Description</label>
            <textarea
              rows={3}
              placeholder="Brief summary of syllabus or domains covered"
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, description: e.target.value })
              }
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-accent"
            />
          </div>

          <div>
            <Input
              label="Icon Identifier"
              placeholder="e.g. network, server, cpu"
              value={categoryForm.icon}
              onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              helperText="Optional Lucide icon name"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="categoryActive"
              checked={categoryForm.active}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, active: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="categoryActive" className="text-xs text-text cursor-pointer">
              Active (Visible in student catalog)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={categorySubmitting}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CATEGORY CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete '${categoryToDelete?.name}'? Note: Deletion is blocked if the category has associated subjects or quizzes.`}
        confirmText="Delete Category"
        isDanger
        isLoading={isDeletingCategory}
      />

      {/* MANAGE SUBJECTS MODAL / DRAWER */}
      <Modal
        isOpen={Boolean(activeCategoryForSubjects)}
        onClose={() => setActiveCategoryForSubjects(null)}
        title={`Subjects: ${activeCategoryForSubjects?.name}`}
        description="Manage the subjects classified under this category"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 mt-2">
          {/* Header Actions for Subjects */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search subjects..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                leftIcon={<Search className="h-3.5 w-3.5 text-muted" />}
              />
            </div>
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={handleOpenCreateSubject}
            >
              Add Subject
            </Button>
          </div>

          {/* Subjects Table */}
          {subjectsLoading ? (
            <div className="py-8 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="py-8 text-center text-muted text-xs border border-dashed border-border rounded-lg">
              {subjectSearch ? 'No matching subjects.' : 'No subjects created for this category yet.'}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 border-b border-border text-muted sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Subject</th>
                    <th className="py-2.5 px-3 font-medium">Slug</th>
                    <th className="py-2.5 px-3 font-medium">Questions</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-text">{sub.name}</div>
                        {sub.description && (
                          <div className="text-muted text-[11px] line-clamp-1">{sub.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted font-mono">{sub.slug}</td>
                      <td className="py-2.5 px-3 text-muted">{sub.questionCount || 0}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={sub.active ? 'success' : 'neutral'} size="sm">
                          {sub.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleOpenEditSubject(sub)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-error hover:bg-error/10 hover:text-error"
                            onClick={() => setSubjectToDelete(sub)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveCategoryForSubjects(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* CREATE / EDIT SUBJECT MODAL */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        description={`Classified under '${activeCategoryForSubjects?.name}'`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitSubject} className="space-y-4 mt-2">
          {subjectFormError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{subjectFormError}</span>
            </div>
          )}

          <div>
            <Input
              label="Subject Name *"
              placeholder="e.g. TCP/IP Protocol Suite"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-text">Description</label>
            <textarea
              rows={3}
              placeholder="Description of topics covered"
              value={subjectForm.description}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, description: e.target.value })
              }
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-accent"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="subjectActive"
              checked={subjectForm.active}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, active: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="subjectActive" className="text-xs text-text cursor-pointer">
              Active
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsSubjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={subjectSubmitting}
            >
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE SUBJECT CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleConfirmDeleteSubject}
        title="Delete Subject"
        message={`Are you sure you want to delete '${subjectToDelete?.name}'? Note: Deletion is blocked if the subject has questions associated with it.`}
        confirmText="Delete Subject"
        isDanger
        isLoading={isDeletingSubject}
      />
    </div>
  );
}
