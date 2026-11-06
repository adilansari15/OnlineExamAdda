import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import {
  Users,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Award,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmStatusModal, setConfirmStatusModal] = useState({ open: false, student: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStudents({
        q: search.trim() || undefined,
        enabled: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        size: pageSize
      });

      const data = res.data;
      setStudents(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load students', err);
      setError(err?.response?.data?.message || 'Failed to fetch student roster');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(0);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(0);
  };

  const handleOpenDetail = async (student) => {
    try {
      const res = await adminService.getStudentById(student.id);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error('Failed to fetch student details', err);
      // Fallback to table row data
      setSelectedStudent(student);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmStatusModal.student) return;
    setActionLoading(true);
    try {
      const target = confirmStatusModal.student;
      const nextStatus = !target.enabled;
      await adminService.updateStudentStatus(target.id, nextStatus);

      // Update state locally
      setStudents((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, enabled: nextStatus } : s))
      );
      if (selectedStudent && selectedStudent.id === target.id) {
        setSelectedStudent((prev) => ({ ...prev, enabled: nextStatus }));
      }
      setConfirmStatusModal({ open: false, student: null });
    } catch (err) {
      console.error('Failed to update student status', err);
      window.alert(err?.response?.data?.message || 'Failed to update student status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        subtitle="Manage registered student accounts, access permissions, and exam histories"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'disabled', label: 'Disabled Only' }
                ]}
              />
            </div>
            <div className="w-64">
              <SearchInput
                placeholder="Search name or email..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={fetchStudents}>
            Retry
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Student</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium text-center">Attempts</th>
                <th className="py-3 px-4 font-medium">Joined</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-5 bg-surface-2 rounded" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-text text-sm">No students found</p>
                    <p className="text-xs text-muted mt-1">
                      {search || statusFilter !== 'all'
                        ? 'Try adjusting your search query or status filter.'
                        : 'Students will appear here once they register on the platform.'}
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center font-semibold text-xs shrink-0">
                          {st.fullName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-text">{st.fullName}</p>
                          <p className="text-[11px] text-muted">ID: #{st.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-text">{st.email}</p>
                      {st.phone && <p className="text-[11px] text-muted">{st.phone}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-text">
                        <Award className="w-3.5 h-3.5 text-accent" />
                        {st.totalAttempts ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                      {formatDate(st.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={st.enabled ? 'success' : 'error'}>
                        {st.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(st)}
                          title="View student details"
                          aria-label={`View details for ${st.fullName}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={st.enabled ? 'text-error hover:text-error' : 'text-success hover:text-success'}
                          onClick={() => setConfirmStatusModal({ open: true, student: st })}
                          title={st.enabled ? 'Disable student login' : 'Enable student login'}
                          aria-label={st.enabled ? `Disable ${st.fullName}` : `Enable ${st.fullName}`}
                        >
                          {st.enabled ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/30 text-xs text-muted">
            <span>
              Showing {students.length} of {totalElements} students
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium text-text">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Student Detail Modal */}
      <Modal
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border">
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-bold text-lg flex items-center justify-center">
                {selectedStudent.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-text text-base">{selectedStudent.fullName}</h4>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {selectedStudent.email}
                </p>
              </div>
              <Badge variant={selectedStudent.enabled ? 'success' : 'error'}>
                {selectedStudent.enabled ? 'Active Account' : 'Disabled'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                <p className="text-xs text-muted">Total Exam Attempts</p>
                <p className="text-xl font-bold text-text mt-1">
                  {selectedStudent.totalAttempts ?? 0}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                <p className="text-xs text-muted">Completed Exams</p>
                <p className="text-xl font-bold text-text mt-1">
                  {selectedStudent.completedAttempts ?? 0}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Account Created:</span>
                <span className="text-text font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(selectedStudent.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={selectedStudent.enabled ? 'text-success font-medium' : 'text-error font-medium'}>
                  {selectedStudent.enabled ? 'Authorized to attempt quizzes' : 'Login and exam taking suspended'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
              <Button
                variant={selectedStudent.enabled ? 'danger' : 'accent'}
                onClick={() => {
                  const target = selectedStudent;
                  setSelectedStudent(null);
                  setConfirmStatusModal({ open: true, student: target });
                }}
              >
                {selectedStudent.enabled ? 'Disable Account' : 'Enable Account'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmStatusModal.open}
        onClose={() => setConfirmStatusModal({ open: false, student: null })}
        title={confirmStatusModal.student?.enabled ? 'Disable Student Account?' : 'Enable Student Account?'}
        size="sm"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 text-muted">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                confirmStatusModal.student?.enabled ? 'text-error' : 'text-accent'
              }`}
            />
            <p>
              {confirmStatusModal.student?.enabled
                ? `Are you sure you want to disable ${confirmStatusModal.student?.fullName}'s account? The student will immediately be blocked from logging in or continuing active examinations.`
                : `Are you sure you want to restore access for ${confirmStatusModal.student?.fullName}? The student will be allowed to log in and attempt published quizzes.`}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setConfirmStatusModal({ open: false, student: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmStatusModal.student?.enabled ? 'danger' : 'accent'}
              onClick={handleConfirmToggleStatus}
              isLoading={actionLoading}
            >
              {confirmStatusModal.student?.enabled ? 'Yes, Disable Account' : 'Yes, Enable Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
