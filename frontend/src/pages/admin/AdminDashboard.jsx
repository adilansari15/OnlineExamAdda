import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, FileQuestion, HelpCircle, Award, PlusCircle, ArrowRight, Clock, UserCheck, BookOpen } from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
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
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Live metrics, quick platform management, and real-time student activities"
        actions={
          <div className="flex gap-2">
            <Link to="/admin/quizzes">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                New Quiz
              </Button>
            </Link>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={fetchDashboard}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface-2 animate-pulse border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={dashboard?.totalStudents?.toLocaleString() ?? '0'}
            subtitle="Registered learner accounts"
            icon={Users}
          />
          <StatCard
            title="Total Quizzes"
            value={dashboard?.totalQuizzes?.toLocaleString() ?? '0'}
            subtitle={`${dashboard?.publishedQuizzes ?? 0} published, ${dashboard?.draftQuizzes ?? 0} draft`}
            icon={FileQuestion}
          />
          <StatCard
            title="Question Bank"
            value={dashboard?.totalQuestions?.toLocaleString() ?? '0'}
            subtitle={`${dashboard?.activeCategories ?? 0} active categories`}
            icon={HelpCircle}
          />
          <StatCard
            title="Total Attempts"
            value={dashboard?.totalAttempts?.toLocaleString() ?? '0'}
            subtitle="Completed assessments"
            icon={Award}
          />
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        <Link to="/admin/quizzes" className="group">
          <Card className="h-full hover:border-border-strong hover:shadow-card transition-all p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 dark:bg-[#202020] text-text border border-border">
                    <FileQuestion className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-text group-hover:text-white transition-colors">
                    Manage Quizzes
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">Create exams, configure time limits, and assign questions.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/questions" className="group">
          <Card className="h-full hover:border-border-strong hover:shadow-card transition-all p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 dark:bg-[#202020] text-text border border-border">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-text group-hover:text-white transition-colors">
                    Question Bank
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">Curate multiple-choice questions, options, and explanations.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/students" className="group">
          <Card className="h-full hover:border-border-strong hover:shadow-card transition-all p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 dark:bg-[#202020] text-text border border-border">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-text group-hover:text-white transition-colors">
                    Student Roster
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">View student profiles, exam histories, and access status.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Platform Activity</CardTitle>
          <span className="text-xs text-muted">Live event log</span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-surface-2 animate-pulse" />
              ))}
            </div>
          ) : !dashboard?.recentActivity || dashboard.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No recent activity recorded yet.</p>
              <p className="text-xs mt-1">Activities will appear as quizzes are created and students register.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {dashboard.recentActivity.map((act) => (
                <div key={act.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-surface-2 dark:bg-[#202020] text-silver border border-border shrink-0">
                    {act.type === 'STUDENT_REGISTERED' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{act.title}</p>
                    <p className="text-xs text-muted truncate">{act.description}</p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap shrink-0">
                    {formatDate(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
