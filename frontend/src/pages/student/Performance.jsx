import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Target, TrendingUp, Award, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { resultService } from '@/services/resultService';

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resultService.getPerformance();
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm">Calculating your performance metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Performance Analytics"
          subtitle="Analyze your subject strengths, accuracy trends, and readiness metrics"
        />
        <div className="p-6 bg-danger/10 border border-danger/30 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <p className="text-sm text-danger font-medium">{error}</p>
          <button
            onClick={fetchPerformance}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-semibold hover:bg-surface-2 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalAttempts = data?.totalAttempts || 0;
  const avgPercentage = data?.averagePercentage != null ? Number(data.averagePercentage).toFixed(1) : '0.0';
  const overallAccuracy = data?.overallAccuracy != null ? Number(data.overallAccuracy).toFixed(1) : '0.0';
  const questionsSolved = data?.totalQuestionsAttempted || 0;
  const categories = data?.categoryMastery || [];
  const trends = data?.scoreTrends || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        subtitle="Analyze your subject strengths, accuracy trends, and readiness metrics"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Attempts"
          value={totalAttempts}
          subtitle="Completed examinations"
          icon={Target}
        />
        <StatCard
          title="Average Score"
          value={`${avgPercentage}%`}
          subtitle="Across all quizzes"
          icon={TrendingUp}
        />
        <StatCard
          title="Overall Accuracy"
          value={`${overallAccuracy}%`}
          subtitle="Correct vs attempted"
          icon={CheckCircle2}
        />
        <StatCard
          title="Questions Solved"
          value={questionsSolved}
          subtitle="Total questions submitted"
          icon={Award}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Mastery */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Mastery Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">
                No category data yet. Attempt quizzes across subjects to unlock your mastery breakdown.
              </div>
            ) : (
              <div className="space-y-5">
                {categories.map((cat) => {
                  const score = Number(cat.averageScore || 0).toFixed(0);
                  const acc = Number(cat.accuracy || 0).toFixed(1);
                  return (
                    <div key={cat.categoryId || cat.categoryName} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-text">
                        <span className="font-semibold">{cat.categoryName}</span>
                        <div className="space-x-3 text-muted">
                          <span>{cat.attemptsCount} {cat.attemptsCount === 1 ? 'attempt' : 'attempts'}</span>
                          <span className="text-accent font-semibold">{score}% avg</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted">
                        <span>Accuracy</span>
                        <span>{acc}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Trend History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempt Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {trends.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">
                No attempt history yet. Take your first quiz to view your score progression.
              </div>
            ) : (
              <div className="space-y-3">
                {trends.map((t, idx) => {
                  const pct = Number(t.percentage || 0).toFixed(1);
                  const isPassed = Number(pct) >= 40.0;
                  return (
                    <div
                      key={t.attemptId || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-2/40 border border-border/50"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-text">{t.quizTitle}</h4>
                        <p className="text-[11px] text-muted">{t.date}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isPassed
                              ? 'bg-success/10 text-success border border-success/30'
                              : 'bg-danger/10 text-danger border border-danger/30'
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
