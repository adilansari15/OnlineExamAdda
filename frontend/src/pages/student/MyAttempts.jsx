import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  History,
  Award,
  Clock,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resultService } from '@/services/resultService';

export default function MyAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resultService.getMyAttempts(page, 10);
      const data = res.data;
      setAttempts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load attempts history', err);
      setError(err?.response?.data?.message || 'Failed to fetch examination history.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Exam Attempts"
        subtitle="Review past examination results, score breakdowns, and track performance improvements"
        actions={
          <Link to="/app/quizzes">
            <Button variant="primary" size="sm">Explore New Quizzes</Button>
          </Link>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAttempts}>
            Retry
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Examination</th>
                <th className="py-3 px-4 font-medium">Attempt</th>
                <th className="py-3 px-4 font-medium">Score</th>
                <th className="py-3 px-4 font-medium">Percentage</th>
                <th className="py-3 px-4 font-medium">Time Taken</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-5 bg-surface-2 rounded" />
                    </td>
                  </tr>
                ))
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-text text-sm">No exam attempts yet</p>
                    <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                      You haven’t completed any quizzes yet. Explore topics and start your first exam!
                    </p>
                    <div className="mt-4">
                      <Link to="/app/quizzes">
                        <Button variant="accent" size="sm" rightIcon={<BookOpen className="w-3.5 h-3.5" />}>
                          Start an Exam
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                attempts.map((item) => (
                  <tr key={item.attemptId} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-text text-sm">{item.quizTitle}</p>
                      <span className="text-[11px] text-accent font-medium uppercase tracking-wider">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-text">
                      Attempt #{item.attemptNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-text flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-accent" />
                        {item.obtainedMarks} / {item.totalMarks}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={item.percentage >= 50 ? 'success' : 'error'}>
                        {item.percentage}%
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted" />
                        {Math.floor((item.timeTakenSeconds || 0) / 60)}m {(item.timeTakenSeconds || 0) % 60}s
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                      {formatDate(item.submittedAt || item.startedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'IN_PROGRESS' ? (
                        <Link to={`/exam/${item.attemptId}`}>
                          <Button variant="accent" size="sm">Resume</Button>
                        </Link>
                      ) : (
                        <Link to={`/app/attempts/${item.attemptId}/result`}>
                          <Button variant="ghost" size="sm" className="text-accent hover:text-accent font-medium">
                            View Result <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/30 text-xs text-muted">
            <span>Showing {attempts.length} of {totalElements} completed attempts</span>
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
    </div>
  );
}
