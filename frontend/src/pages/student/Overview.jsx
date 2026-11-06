import { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  PlayCircle,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/services/studentService';

export default function Overview() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getDashboard();
      setDashboard(res?.data || res || null);
    } catch (err) {
      console.error('Failed to load student dashboard', err);
      setError(err?.response?.data?.message || 'Failed to load your learning dashboard');
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
      return new Date(isoString).toLocaleDateString(undefined, {
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
      {/* Welcome & Motivational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-2xl bg-surface border border-border shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-2 dark:bg-[#202020] text-silver border border-border">
              <Sparkles className="w-3.5 h-3.5 text-silver" /> Learner Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-text tracking-tight">
            Welcome back, {user?.fullName || 'Student'}!
          </h2>
          <p className="text-xs sm:text-sm text-silver max-w-xl leading-relaxed">
            Sharpen your knowledge with timed mock examinations, evaluate your readiness, and master every concept.
          </p>
        </div>
        <Link to="/app/quizzes" className="shrink-0">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Quizzes
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      )}

      {/* 4 Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface-2 animate-pulse border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Quizzes Attempted"
            value={dashboard?.stats?.quizzesAttempted?.toString() ?? '0'}
            subtitle="Completed & active tests"
            icon={BookOpen}
          />
          <StatCard
            title="Average Score"
            value={dashboard?.stats?.averageScore ? `${dashboard.stats.averageScore}%` : '0%'}
            subtitle="Across attempted quizzes"
            icon={Award}
          />
          <StatCard
            title="Accuracy Rate"
            value={dashboard?.stats?.accuracyPercentage ? `${dashboard.stats.accuracyPercentage}%` : '0%'}
            subtitle="Correct responses ratio"
            icon={CheckCircle}
          />
          <StatCard
            title="Questions Solved"
            value={dashboard?.stats?.questionsAttempted?.toString() ?? '0'}
            subtitle="Practice questions"
            icon={Clock}
          />
        </div>
      )}

      {/* Continue Learning / Ongoing Attempt */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold font-display text-text flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-silver" />
          Continue Learning
        </h3>

        {loading ? (
          <div className="h-24 rounded-2xl bg-surface-2 animate-pulse" />
        ) : !dashboard?.continueLearning || dashboard.continueLearning.length === 0 ? (
          <Card className="p-6 text-center text-muted">
            <p className="text-sm font-medium text-text">No active exams in progress</p>
            <p className="text-xs text-silver mt-1">Ready to test your skills? Choose from curated quizzes across 12 disciplines.</p>
            <div className="mt-4">
              <Link to="/app/quizzes">
                <Button variant="secondary" size="sm">Browse Quizzes</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.continueLearning.map((quiz) => (
              <Card key={quiz.id} className="p-5 border-border bg-surface flex items-center justify-between">
                <div className="space-y-1 min-w-0 pr-4">
                  <span className="text-[10px] font-semibold text-silver uppercase tracking-wider">{quiz.categoryName}</span>
                  <h4 className="font-semibold text-sm text-text truncate">{quiz.title}</h4>
                  <p className="text-xs text-muted flex items-center gap-3">
                    <span>{quiz.durationMinutes} mins</span>
                    <span>•</span>
                    <span>{quiz.questionCount ?? 0} questions</span>
                  </p>
                </div>
                <Link to={`/exam/${quiz.id}`} className="shrink-0">
                  <Button variant="primary" size="sm">Resume</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Quizzes & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Quizzes (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-display text-text">Recommended For You</h3>
            <Link to="/app/quizzes" className="text-xs font-medium text-silver hover:text-white transition-colors">
              View All Quizzes
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-surface-2 animate-pulse" />
              ))}
            </div>
          ) : !dashboard?.recommendedQuizzes || dashboard.recommendedQuizzes.length === 0 ? (
            <Card className="p-8 text-center text-muted">
              <p className="text-sm text-text">No recommendations yet.</p>
              <p className="text-xs mt-1 text-silver">Explore all available quizzes to get customized recommendations.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboard.recommendedQuizzes.slice(0, 4).map((quiz) => (
                <Card key={quiz.id} className="p-4 flex flex-col justify-between hover:border-border-strong transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-medium text-silver uppercase tracking-wider truncate">
                        {quiz.categoryName}
                      </span>
                      <Badge difficulty={quiz.difficulty} />
                    </div>
                    <h4 className="font-semibold text-sm text-text line-clamp-1">{quiz.title}</h4>
                    <p className="text-xs text-muted line-clamp-2 mt-1">
                      {quiz.description || 'Practice exam designed for subject knowledge testing.'}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between mt-3 text-xs text-muted">
                    <span>{quiz.durationMinutes} mins • {quiz.questionCount ?? 0} Qs</span>
                    <Link to={`/app/quizzes/${quiz.id}`}>
                      <Button variant="ghost" size="sm" className="text-silver hover:text-white">
                        Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Stream (1 col) */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text">Recent Activity</h3>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-surface-2 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : !dashboard?.recentActivity || dashboard.recentActivity.length === 0 ? (
                <div className="py-8 text-center text-muted">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium text-text">No activity yet</p>
                  <p className="text-[11px] mt-0.5">Your exam starts and scores will be logged here.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 text-xs">
                  {dashboard.recentActivity.map((act) => (
                    <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <p className="font-medium text-text">{act.title}</p>
                      <p className="text-[11px] text-muted truncate">{act.description}</p>
                      <p className="text-[10px] text-muted/80">{formatDate(act.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
