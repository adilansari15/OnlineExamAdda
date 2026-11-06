import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { resultService } from '@/services/resultService';

export default function ResultDashboard() {
  const { id } = useParams(); // attemptId
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    resultService.getResult(id)
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        console.error('Failed to load exam result', err);
        setError(err?.response?.data?.message || 'Failed to fetch examination results.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12">
        <div className="h-10 w-48 bg-surface-2 rounded animate-pulse" />
        <div className="h-44 bg-surface-2 rounded-2xl animate-pulse" />
        <div className="h-96 bg-surface-2 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto opacity-70" />
        <h3 className="text-lg font-bold text-text">Result Not Ready</h3>
        <p className="text-xs text-muted">{error || 'This examination attempt has not been evaluated or does not exist.'}</p>
        <Link to="/app/overview">
          <Button variant="accent" size="sm">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isPassed = result.percentage >= 50;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title={`Results: ${result.quizTitle}`}
        subtitle={`Evaluation report • Category: ${result.categoryName} • Status: ${result.status}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/app/quizzes/${result.quizId}`}>
              <Button variant="secondary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Retake Exam
              </Button>
            </Link>
            <Link to="/app/attempts">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                My Attempts
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary Scorecard */}
      <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border shadow-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-5">
            <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-bold text-3xl font-display shadow-2xs border ${
              isPassed
                ? 'bg-[#E8F5EC] dark:bg-[#1D2922] text-[#1E6B37] dark:text-[#A9D5B5] border-[#C2E2CC] dark:border-[#2D3D32]'
                : 'bg-[#FDF0F0] dark:bg-[#2D1D1D] text-[#9C2B2B] dark:text-[#E3AAAA] border-[#F3C4C4] dark:border-[#482D2D]'
            }`}>
              <span>{result.percentage}%</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider font-sans">Score</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-text">
                  {isPassed ? 'Passed Examination' : 'Needs Practice'}
                </h3>
                <Badge variant={isPassed ? 'success' : 'error'}>
                  {isPassed ? 'Qualified' : 'Not Qualified'}
                </Badge>
              </div>
              <p className="text-xs text-silver mt-1">
                Obtained <strong>{result.obtainedMarks}</strong> out of <strong>{result.totalMarks}</strong> total possible marks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-muted block text-[11px]">Accuracy</span>
              <span className="font-bold text-text text-base mt-0.5 block tabular-nums">{result.accuracy}%</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-muted block text-[11px]">Time Taken</span>
              <span className="font-bold text-text text-base mt-0.5 block tabular-nums">
                {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-muted block text-[11px]">Questions</span>
              <span className="font-bold text-text text-base mt-0.5 block tabular-nums">{result.totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Detailed counts pill bar */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-xs font-medium text-center">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#E8F5EC] dark:bg-[#1D2922] text-[#1E6B37] dark:text-[#A9D5B5] border border-[#C2E2CC] dark:border-[#2D3D32]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{result.correctCount} Correct</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#FDF0F0] dark:bg-[#2D1D1D] text-[#9C2B2B] dark:text-[#E3AAAA] border border-[#F3C4C4] dark:border-[#482D2D]">
            <XCircle className="w-4 h-4" />
            <span>{result.incorrectCount} Incorrect</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-surface-2 text-silver border border-border">
            <HelpCircle className="w-4 h-4" />
            <span>{result.unattemptedCount} Unattempted</span>
          </div>
        </div>
      </div>

      {/* Question by Question Comprehensive Review */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          Question-by-Question Review
        </h3>

        <div className="space-y-4">
          {result.questions?.map((q, idx) => {
            const hasAttempted = q.studentSelectedOptionId != null;
            return (
              <Card key={q.questionId} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 text-xs">
                  <span className="font-bold text-muted">Question #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={!hasAttempted ? 'outline' : q.isCorrect ? 'success' : 'error'}>
                      {!hasAttempted ? 'Unattempted' : q.isCorrect ? 'Correct (+Marks)' : 'Incorrect (Deducted)'}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-text">
                      {q.marksAwarded > 0 ? `+${q.marksAwarded}` : q.marksAwarded} pts
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-text leading-relaxed select-none">
                  {q.questionText}
                </p>

                {/* Option review breakdown */}
                <div className="space-y-2 pt-1">
                  {q.options?.map((opt) => {
                    const isSelected = q.studentSelectedOptionId === opt.id;
                    const isCorrectAnswer = Boolean(opt.isCorrect);

                    let optStyle = 'border-border bg-surface-2/40 text-muted';
                    if (isCorrectAnswer) {
                      optStyle = 'border-[#C2E2CC] dark:border-[#2D3D32] bg-[#E8F5EC] dark:bg-[#1D2922] text-[#1E6B37] dark:text-[#A9D5B5] font-semibold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optStyle = 'border-[#F3C4C4] dark:border-[#482D2D] bg-[#FDF0F0] dark:bg-[#2D1D1D] text-[#9C2B2B] dark:text-[#E3AAAA] font-semibold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold shrink-0">
                            {String.fromCharCode(64 + (opt.position || 1))}.
                          </span>
                          <span>{opt.optionText}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-1 font-semibold text-[11px]">
                          {isCorrectAnswer && <span className="text-emerald-400">Correct Answer</span>}
                          {isSelected && !isCorrectAnswer && <span className="text-[#E3AAAA]">Your Choice</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs space-y-1">
                    <p className="font-semibold text-text flex items-center gap-1.5 text-silver">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Concept Explanation
                    </p>
                    <p className="text-muted leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
