import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  PlayCircle,
  FileText
} from 'lucide-react';
import { studentService } from '@/services/studentService';
import { examService } from '@/services/examService';

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    studentService.getQuizById(id)
      .then((res) => {
        setQuiz(res?.data || res || null);
      })
      .catch((err) => {
        console.error('Failed to load quiz details', err);
        setError(err?.response?.data?.message || 'Failed to load examination details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartExam = async () => {
    if (!quiz?.canAttempt) return;
    setStarting(true);
    try {
      if (quiz.inProgressAttemptId) {
        navigate(`/exam/${quiz.inProgressAttemptId}`);
        return;
      }
      const res = await examService.startAttempt(id);
      const attemptId = res.data?.attemptId || res.data?.id;
      navigate(`/exam/${attemptId}`);
    } catch (err) {
      console.error('Failed to start attempt', err);
      window.alert(err?.response?.data?.message || 'Failed to initiate examination');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-4 w-28 bg-surface-2 rounded animate-pulse" />
        <div className="h-16 bg-surface-2 rounded-xl animate-pulse" />
        <div className="h-80 bg-surface-2 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Link to="/app/quizzes" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Quizzes</span>
        </Link>
        <div className="p-6 rounded-2xl bg-surface border border-border text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-error mx-auto opacity-70" />
          <h3 className="text-base font-semibold text-text">Quiz Unavailable</h3>
          <p className="text-xs text-muted">{error || 'The requested examination could not be found or has not been published.'}</p>
          <div className="pt-2">
            <Link to="/app/quizzes">
              <Button variant="secondary" size="sm">Return to Quizzes</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasNegative = quiz.negativeMarks && parseFloat(quiz.negativeMarks) > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/app/quizzes" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Quizzes</span>
      </Link>

      <PageHeader
        title={quiz.title}
        subtitle={quiz.description || `Curriculum examination under ${quiz.categoryName}`}
        badge={<Badge difficulty={quiz.difficulty} />}
      />

      {/* Access restrictions notice if not allowed */}
      {!quiz.canAttempt && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Examination Unavailable for Attempt</p>
            <p className="mt-0.5 text-warning/90">{quiz.cannotAttemptReason || 'You are currently not eligible to take this exam.'}</p>
          </div>
        </div>
      )}

      {/* In-progress banner if ongoing */}
      {quiz.inProgressAttemptId && (
        <div className="p-4 rounded-xl bg-surface-2 border border-border text-silver text-xs flex items-start gap-3">
          <PlayCircle className="w-4 h-4 shrink-0 mt-0.5 text-white" />
          <div>
            <p className="font-semibold text-sm text-text font-display">Active Attempt In Progress</p>
            <p className="mt-0.5 text-silver">You have an ongoing exam session. Your remaining time will continue counting down from the server clock.</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
            <FileText className="w-4 h-4 text-silver" />
            Exam Structure & Marking Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-2 border border-border text-center">
            <div>
              <span className="text-[11px] text-muted block">Duration</span>
              <span className="font-semibold text-text text-sm flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-silver" />
                {quiz.durationMinutes} Minutes
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted block">Total Questions</span>
              <span className="font-semibold text-text text-sm flex items-center justify-center gap-1 mt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-silver" />
                {quiz.questionCount ?? 0} MCQs
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted block">Maximum Marks</span>
              <span className="font-semibold text-text text-sm flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5 text-silver" />
                {quiz.totalMarks ?? 0} pts
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted block">Attempts Used</span>
              <span className="font-semibold text-text text-sm flex items-center justify-center gap-1 mt-0.5">
                {quiz.attemptsUsed ?? 0} {quiz.maxAttempts ? `/ ${quiz.maxAttempts}` : 'taken'}
              </span>
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-text text-sm font-display">Marking Scheme:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#E8F5EC] dark:bg-[#1D2922] border border-[#C2E2CC] dark:border-[#2D3D32]">
                <span className="text-[#1E6B37] dark:text-[#A9D5B5] font-semibold block">+ {quiz.marksPerQuestion ?? 1} Marks</span>
                <span className="text-muted text-[11px]">Awarded for every correctly chosen answer option.</span>
              </div>
              <div className={`p-3 rounded-xl ${hasNegative ? 'bg-[#FDF0F0] dark:bg-[#2D1D1D] border border-[#F3C4C4] dark:border-[#482D2D]' : 'bg-surface-2 border border-border'}`}>
                <span className={`font-semibold block ${hasNegative ? 'text-[#9C2B2B] dark:text-[#E3AAAA]' : 'text-text'}`}>
                  {hasNegative ? `- ${quiz.negativeMarks} Marks` : 'No Negative Penalty'}
                </span>
                <span className="text-muted text-[11px]">
                  {hasNegative
                    ? 'Deducted for incorrect answers. Unattempted questions incur 0 deduction.'
                    : 'No marks deducted for incorrect answers.'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-text text-sm font-display">Official Examination Guidelines:</h4>
            {quiz.instructions ? (
              <div className="p-4 rounded-xl bg-surface-2 border border-border text-muted whitespace-pre-line leading-relaxed">
                {quiz.instructions}
              </div>
            ) : (
              <div className="space-y-1.5 text-muted leading-relaxed">
                <p>• The exam clock is governed by the server; closing or refreshing the tab will not pause the timer.</p>
                <p>• Answers and question review flags are auto-saved in the background instantaneously.</p>
                <p>• When the timer expires, your exam will be automatically locked and submitted.</p>
              </div>
            )}
          </div>

          {/* Agreement & Action */}
          <div className="pt-4 border-t border-border space-y-4">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-silver"
              />
              <span className="text-text leading-tight">
                I have carefully read all examination guidelines, time limits, and scoring parameters. I am ready to begin the test.
              </span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <Link to="/app/quizzes">
                <Button variant="secondary" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                size="md"
                disabled={!quiz.canAttempt || !agreed || starting}
                isLoading={starting}
                onClick={handleStartExam}
                rightIcon={<PlayCircle className="w-4 h-4" />}
              >
                {quiz.inProgressAttemptId ? 'Resume Active Exam' : 'Start Examination'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
