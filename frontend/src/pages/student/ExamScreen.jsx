import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  RotateCcw,
  Send,
  Loader2
} from 'lucide-react';
import { examService } from '@/services/examService';

export default function ExamScreen() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active question index (0-based)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map of answers: { [questionId]: { selectedOptionId, markedForReview, visited } }
  const [answers, setAnswers] = useState({});
  const [savingStatus, setSavingStatus] = useState('saved'); // 'saving' | 'saved' | 'error'

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const syncIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // 1. Initial Load of Attempt
  const fetchAttempt = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await examService.getAttempt(attemptId);
      const data = res.data;
      setAttempt(data);
      setRemainingSeconds(data.remainingSeconds);

      // Hydrate answers map from savedAnswers
      const map = {};
      if (data.savedAnswers) {
        data.savedAnswers.forEach((sa) => {
          const qId = sa.questionId || sa.id;
          map[qId] = {
            selectedOptionId: sa.selectedOptionId,
            markedForReview: Boolean(sa.markedForReview || sa.isMarkedForReview),
            visited: Boolean(sa.visited)
          };
        });
      }
      // Ensure all questions exist in answers map
      data.questions.forEach((q, idx) => {
        const qId = q.questionId || q.id;
        if (!map[qId]) {
          map[qId] = {
            selectedOptionId: q.selectedOptionId || null,
            markedForReview: Boolean(q.markedForReview || q.isMarkedForReview),
            visited: idx === 0
          };
        }
      });
      setAnswers(map);
    } catch (err) {
      console.error('Failed to load exam attempt', err);
      setError(err?.response?.data?.message || 'Failed to initialize examination session.');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchAttempt();
  }, [fetchAttempt]);

  // 2. Submit Handler
  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await examService.submitAttempt(attemptId);
      navigate(`/app/attempts/${attemptId}/result`);
    } catch (err) {
      console.error('Failed to submit exam', err);
      // Even if already submitted, redirect to result
      navigate(`/app/attempts/${attemptId}/result`);
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, isSubmitting, navigate]);

  // 3. Timer Countdown & Re-sync
  useEffect(() => {
    if (loading || error || remainingSeconds <= 0) return;

    timerIntervalRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerIntervalRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Re-sync with server every 45 seconds
    syncIntervalRef.current = window.setInterval(async () => {
      try {
        const res = await examService.getAttempt(attemptId);
        if (res.data?.remainingSeconds !== undefined) {
          setRemainingSeconds(res.data.remainingSeconds);
        }
      } catch {
        // Silently continue local ticking
      }
    }, 45000);

    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (syncIntervalRef.current) window.clearInterval(syncIntervalRef.current);
    };
  }, [loading, error, attemptId, handleSubmitExam, remainingSeconds]);

  // Mark current question as visited
  const currentQuestion = attempt?.questions?.[currentIndex];
  const currentQuestionId = currentQuestion ? (currentQuestion.questionId || currentQuestion.id) : null;

  useEffect(() => {
    if (!currentQuestion || !currentQuestionId) return;
    setAnswers((prev) => {
      const current = prev[currentQuestionId] || {};
      if (current.visited) return prev;
      const updated = {
        ...prev,
        [currentQuestionId]: {
          ...current,
          visited: true
        }
      };
      // Trigger autosave visited
      examService.autosaveAnswer(attemptId, currentQuestionId, {
        selectedOptionId: current.selectedOptionId || null,
        markedForReview: current.markedForReview || false,
        visited: true
      }).catch(() => {});
      return updated;
    });
  }, [currentQuestion, currentQuestionId, attemptId]);

  // 4. Autosave Answer
  const saveAnswer = async (questionId, newAnswer) => {
    setSavingStatus('saving');
    try {
      await examService.autosaveAnswer(attemptId, questionId, {
        selectedOptionId: newAnswer.selectedOptionId,
        markedForReview: newAnswer.markedForReview,
        visited: true
      });
      setSavingStatus('saved');
    } catch (err) {
      console.error('Autosave failed', err);
      setSavingStatus('error');
    }
  };

  const handleSelectOption = (optionId) => {
    if (!currentQuestion || !currentQuestionId) return;
    const currentA = answers[currentQuestionId] || {};
    const updated = {
      ...currentA,
      selectedOptionId: optionId,
      visited: true
    };
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: updated }));
    saveAnswer(currentQuestionId, updated);
  };

  const handleClearResponse = () => {
    if (!currentQuestion || !currentQuestionId) return;
    const currentA = answers[currentQuestionId] || {};
    const updated = {
      ...currentA,
      selectedOptionId: null
    };
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: updated }));
    saveAnswer(currentQuestionId, updated);
  };

  const handleToggleReview = () => {
    if (!currentQuestion || !currentQuestionId) return;
    const currentA = answers[currentQuestionId] || {};
    const updated = {
      ...currentA,
      markedForReview: !currentA.markedForReview,
      visited: true
    };
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: updated }));
    saveAnswer(currentQuestionId, updated);
  };

  // Format Timer mm:ss or hh:mm:ss
  const formattedTimer = useMemo(() => {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  // Palette Counts
  const stats = useMemo(() => {
    if (!attempt?.questions) return { answered: 0, marked: 0, notAnswered: 0, notVisited: 0 };
    let answered = 0;
    let marked = 0;
    let notAnswered = 0;
    let notVisited = 0;

    attempt.questions.forEach((q) => {
      const qId = q.questionId || q.id;
      const a = answers[qId];
      if (!a || !a.visited) {
        notVisited++;
      } else if (a.selectedOptionId != null) {
        answered++;
        if (a.markedForReview) marked++;
      } else {
        notAnswered++;
        if (a.markedForReview) marked++;
      }
    });

    return { answered, marked, notAnswered, notVisited };
  }, [attempt, answers]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-sm font-medium text-text">Loading examination workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="p-8 rounded-2xl bg-surface border border-border text-center max-w-md space-y-4">
          <AlertTriangle className="w-10 h-10 text-error mx-auto opacity-70" />
          <h3 className="text-base font-semibold text-text">Examination Unavailable</h3>
          <p className="text-xs text-muted">{error || 'Session is no longer valid or has already expired.'}</p>
          <Button variant="accent" size="sm" onClick={() => navigate('/app/quizzes')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentAns = answers[currentQuestionId] || {};
  const isTimerCritical = remainingSeconds <= 300; // under 5 minutes

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Top Banner: Quiz Title, Timer, & Live Save Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border shadow-xs">
        <div>
          <h2 className="text-sm font-bold font-display text-text truncate">{attempt.quizTitle}</h2>
          <span className="text-[11px] text-muted">
            Question {currentIndex + 1} of {attempt.questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted flex items-center gap-1.5">
            {savingStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-silver animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {savingStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Saved</span>
              </>
            )}
            {savingStatus === 'error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-error" />
                <span className="text-error font-medium">Save failed</span>
              </>
            )}
          </span>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums transition-colors ${
              isTimerCritical
                ? 'bg-error/10 border-error/30 text-error animate-pulse'
                : 'bg-surface-2 border-border text-text'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-error' : 'text-silver'}`} />
            <span>{formattedTimer}</span>
          </div>

          <Button variant="primary" size="sm" onClick={() => setShowSubmitModal(true)}>
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Main Examination Workspace: Question View & Palette */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Question & Options */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-surface border border-border space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
              <span className="font-semibold text-text">Question #{currentIndex + 1}</span>
              <span className="text-muted">
                Marks: +{attempt.marksPerQuestion} / -{attempt.negativeMarks}
              </span>
            </div>

            <h3 className="text-[17px] sm:text-[18px] font-medium text-text leading-[1.6] select-none">
              {currentQuestion?.questionText || currentQuestion?.text}
            </h3>

            {/* Options selection */}
            <div className="space-y-3 pt-2">
              {currentQuestion?.options.map((opt) => {
                const isSelected = currentAns.selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center gap-3.5 px-4 py-3 min-h-[52px] rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#EAEAEA] dark:border-[#EAEAEA] bg-[#EEEEEE] dark:bg-[#202020] text-text dark:text-white shadow-xs'
                        : 'border-[#D8D8D8] dark:border-[#414141] bg-surface dark:bg-[#171717] hover:bg-surface-2 dark:hover:bg-[#202020] text-text'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-fg shadow-2xs'
                          : 'border border-border text-muted bg-surface-2'
                      }`}
                    >
                      {String.fromCharCode(64 + (opt.position || 1))}
                    </div>
                    <span className="text-[15px] leading-[1.45] select-none">
                      {opt.optionText || opt.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant={currentAns.markedForReview ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleToggleReview}
                leftIcon={<Bookmark className="w-3.5 h-3.5" />}
              >
                {currentAns.markedForReview ? 'Marked for Review' : 'Mark for Review'}
              </Button>

              {currentAns.selectedOptionId != null && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResponse}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-muted hover:text-error"
                >
                  Clear Selection
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={currentIndex === attempt.questions.length - 1}
                onClick={() => setCurrentIndex((idx) => Math.min(attempt.questions.length - 1, idx + 1))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette */}
        <div className="w-full lg:w-80 shrink-0 p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold font-display text-text">Question Palette</h4>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted pb-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#E8F5EC] dark:bg-[#1D2922] border border-[#C2E2CC] dark:border-[#2D3D32]" />
                <span>Answered ({stats.answered})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#FCF5E5] dark:bg-[#302B22] border border-[#EED8A7] dark:border-[#4D4233]" />
                <span>Review ({stats.marked})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#EEEEEE] dark:bg-[#292929] border border-[#B0B0B0] dark:border-[#444444]" />
                <span>Not Answered ({stats.notAnswered})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#EEEEEE] dark:bg-[#202020] border border-[#D8D8D8] dark:border-[#2D2D2D]" />
                <span>Not Visited ({stats.notVisited})</span>
              </div>
            </div>

            {/* Number grid */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {attempt.questions.map((q, idx) => {
                const a = answers[q.questionId || q.id];
                const isCurrent = currentIndex === idx;
                const isAnswered = a?.selectedOptionId != null;
                const isMarked = a?.markedForReview;
                const isVisited = a?.visited;

                let btnClass = 'bg-[#EEEEEE] dark:bg-[#202020] text-[#777777] border border-[#D8D8D8] dark:border-[#2D2D2D]';
                if (isAnswered && isMarked) {
                  btnClass = 'bg-[#F2F1FA] dark:bg-[#25252B] text-[#5B4E99] dark:text-[#C5C5D5] border border-[#D5D1EB] dark:border-[#3E3E4B] font-semibold';
                } else if (isMarked) {
                  btnClass = 'bg-[#FCF5E5] dark:bg-[#302B22] text-[#8A6414] dark:text-[#E0C995] border border-[#EED8A7] dark:border-[#4D4233] font-semibold';
                } else if (isAnswered) {
                  btnClass = 'bg-[#E8F5EC] dark:bg-[#1D2922] text-[#1E6B37] dark:text-[#A9D5B5] border border-[#C2E2CC] dark:border-[#2D3D32] font-semibold';
                } else if (isVisited) {
                  btnClass = 'bg-[#EEEEEE] dark:bg-[#292929] text-[#111111] dark:text-[#D0D0D0] border border-[#B0B0B0] dark:border-[#444444]';
                }

                return (
                  <button
                    key={q.questionId || q.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center relative ${btnClass} ${
                      isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-bg z-10' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setShowSubmitModal(true)}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Examination
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Examination?"
        size="sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-muted text-xs">
            Are you sure you want to finalize your examination? Once submitted, your answers cannot be modified.
          </p>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-2 border border-border text-xs">
            <div>
              <span className="text-muted block">Questions Answered:</span>
              <span className="font-bold text-emerald-400 text-sm">{stats.answered}</span>
            </div>
            <div>
              <span className="text-muted block">Unanswered:</span>
              <span className="font-bold text-[#E3AAAA] text-sm">{stats.notAnswered + stats.notVisited}</span>
            </div>
            <div>
              <span className="text-muted block">Marked for Review:</span>
              <span className="font-bold text-[#E0C995] text-sm">{stats.marked}</span>
            </div>
            <div>
              <span className="text-muted block">Time Remaining:</span>
              <span className="font-bold text-text text-sm font-mono">{formattedTimer}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowSubmitModal(false)}
              disabled={isSubmitting}
            >
              Return to Exam
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitExam}
              isLoading={isSubmitting}
            >
              Yes, Submit Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
