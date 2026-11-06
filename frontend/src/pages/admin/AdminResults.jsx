import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { RefreshCw, AlertCircle, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { resultService } from '@/services/resultService';
import { quizService } from '@/services/quizService';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load quizzes for filter dropdown
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizService.getQuizzes({ size: 100 });
        const list = res?.data?.data?.content || [];
        setQuizzes(list);
      } catch {
        // non-blocking
      }
    };
    fetchQuizzes();
  }, []);

  // Fetch paginated admin results
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, size: 10 };
      if (selectedQuizId) {
        params.quizId = selectedQuizId;
      }
      const res = await resultService.getAdminResults(params);
      const pageData = res?.data || {};
      setResults(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load examination results.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedQuizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleFilterChange = (e) => {
    setSelectedQuizId(e.target.value);
    setPage(0);
  };

  const formatTime = (secs) => {
    if (!secs && secs !== 0) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Examination Results"
          subtitle="Monitor student submissions, evaluate scores, and inspect detailed answer keys"
        />

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={selectedQuizId}
            onChange={handleFilterChange}
            className="px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Quizzes</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading examination results...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-danger/10 border border-danger/30 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <p className="text-sm text-danger font-medium">{error}</p>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-semibold hover:bg-surface-2 transition"
          >
            Retry
          </button>
        </div>
      ) : results.length === 0 ? (
        <Card className="p-8 text-center text-muted text-sm">
          No examination results found.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 border-b border-border text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Student</th>
                  <th className="py-3 px-4 font-medium">Quiz & Category</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Score</th>
                  <th className="py-3 px-4 font-medium">Percentage</th>
                  <th className="py-3 px-4 font-medium">Accuracy</th>
                  <th className="py-3 px-4 font-medium">Time Taken</th>
                  <th className="py-3 px-4 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {results.map((r) => {
                  const pct = Number(r.percentage || 0).toFixed(1);
                  const isPassed = Number(pct) >= 40.0;
                  return (
                    <tr key={r.resultId || r.attemptId} className="hover:bg-surface-2/40 transition">
                      <td className="py-3.5 px-4 font-medium text-text">
                        <div className="font-semibold text-text">{r.studentName || 'Unknown Student'}</div>
                        <div className="text-[11px] text-muted">{r.studentEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-text">
                        <div className="font-medium text-text">{r.quizTitle}</div>
                        <div className="text-[11px] text-muted">{r.categoryName || 'General'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            r.status === 'SUBMITTED'
                              ? 'bg-success/10 text-success border border-success/30'
                              : 'bg-warning/10 text-warning border border-warning/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {r.status || 'SUBMITTED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-text">
                        {Number(r.obtainedMarks || 0).toFixed(1)} / {Number(r.totalMarks || 0).toFixed(0)}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={isPassed ? 'text-success' : 'text-danger'}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text font-medium">
                        {Number(r.accuracy || 0).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(r.timeTakenSeconds)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {formatDate(r.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/20 text-xs text-muted">
            <span>
              Showing {results.length} of {totalElements} results (Page {page + 1} of {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1 rounded border border-border bg-surface hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-1 rounded border border-border bg-surface hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
