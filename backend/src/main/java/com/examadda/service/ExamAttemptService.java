package com.examadda.service;

import com.examadda.dto.*;
import com.examadda.entity.*;
import com.examadda.exception.ApiException;
import com.examadda.exception.ErrorCode;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamAttemptService {

    private final ExamAttemptRepository examAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final QuizRepository quizRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    private static final long GRACE_PERIOD_SECONDS = 3L;

    @Transactional
    public StartAttemptResponse startOrResumeAttempt(Long quizId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Quiz quiz = quizRepository.findByIdAndStatus(quizId, QuizStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        Instant now = clock.instant();

        // 1. Check existing IN_PROGRESS attempt -> Resume it
        Optional<ExamAttempt> inProgressOpt = examAttemptRepository.findByUserIdAndQuizIdAndStatus(userId, quizId, AttemptStatus.IN_PROGRESS);
        if (inProgressOpt.isPresent()) {
            ExamAttempt existing = inProgressOpt.get();
            // If expired past grace, auto-submit
            if (now.isAfter(existing.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
                submitAttempt(existing.getId(), userId, true);
                throw new ApiException(ErrorCode.ATTEMPT_CLOSED, "Your ongoing attempt has expired and was auto-submitted.");
            }
            return buildStartAttemptResponse(existing, now);
        }

        // 2. Schedule window validation
        if (quiz.getStartAt() != null && now.isBefore(quiz.getStartAt())) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Examination schedule has not started yet.");
        }
        if (quiz.getEndAt() != null && now.isAfter(quiz.getEndAt())) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Examination deadline has passed.");
        }

        // 3. Max attempts validation
        long attemptsCount = examAttemptRepository.countByUserIdAndQuizId(userId, quizId);
        if (quiz.getMaxAttempts() != null && quiz.getMaxAttempts() > 0 && attemptsCount >= quiz.getMaxAttempts()) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Maximum attempt limit reached for this quiz (" + quiz.getMaxAttempts() + ").");
        }

        // 4. Calculate startedAt & expiresAt
        Instant startedAt = now;
        long durationSec = quiz.getDurationMinutes() * 60L;
        Instant expiresAt = startedAt.plusSeconds(durationSec);
        if (quiz.getEndAt() != null && quiz.getEndAt().isBefore(expiresAt)) {
            expiresAt = quiz.getEndAt();
        }

        int nextAttemptNo = (int) attemptsCount + 1;

        // 5. Create ExamAttempt
        ExamAttempt attempt = ExamAttempt.builder()
                .user(user)
                .quiz(quiz)
                .attemptNo(nextAttemptNo)
                .status(AttemptStatus.IN_PROGRESS)
                .startedAt(startedAt)
                .expiresAt(expiresAt)
                .marksPerQuestion(quiz.getMarksPerQuestion())
                .negativeMarks(quiz.getNegativeMarks() != null ? quiz.getNegativeMarks() : BigDecimal.ZERO)
                .build();

        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);

        // 6. Pre-populate StudentAnswer rows in position order
        List<QuizQuestion> sortedQuestions = new ArrayList<>(quiz.getQuizQuestions());
        sortedQuestions.sort(Comparator.comparing(QuizQuestion::getPosition));

        List<StudentAnswer> answerRows = new ArrayList<>();
        for (QuizQuestion qq : sortedQuestions) {
            answerRows.add(StudentAnswer.builder()
                    .attempt(savedAttempt)
                    .question(qq.getQuestion())
                    .position(qq.getPosition())
                    .visited(false)
                    .markedForReview(false)
                    .build());
        }
        studentAnswerRepository.saveAll(answerRows);
        savedAttempt.setAnswers(answerRows);

        return buildStartAttemptResponse(savedAttempt, now);
    }

    @Transactional
    public StartAttemptResponse getAttemptState(Long attemptId, Long userId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", "id", attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN, "You are not authorized to view this exam attempt.");
        }

        Instant now = clock.instant();

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS && now.isAfter(attempt.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
            submitAttempt(attemptId, userId, true);
            throw new ApiException(ErrorCode.ATTEMPT_CLOSED, "Examination session has expired.");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ApiException(ErrorCode.ATTEMPT_CLOSED, "Examination has already been closed with status " + attempt.getStatus());
        }

        return buildStartAttemptResponse(attempt, now);
    }

    @Transactional
    public void autosaveAnswer(Long attemptId, Long questionId, Long userId, AutosaveAnswerRequest request) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", "id", attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN, "Unauthorized exam attempt access.");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ApiException(ErrorCode.ATTEMPT_CLOSED, "Cannot save answers on an inactive examination.");
        }

        Instant now = clock.instant();
        if (now.isAfter(attempt.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
            submitAttempt(attemptId, userId, true);
            throw new ApiException(ErrorCode.ATTEMPT_CLOSED, "Examination time expired. Answers locked.");
        }

        StudentAnswer studentAnswer = studentAnswerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));

        QuestionOption option = null;
        if (request.getSelectedOptionId() != null) {
            option = questionOptionRepository.findById(request.getSelectedOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Option", "id", request.getSelectedOptionId()));

            // Validate option belongs to question
            if (!option.getQuestion().getId().equals(questionId)) {
                throw new ApiException(ErrorCode.VALIDATION_FAILED, "Option does not belong to specified question.");
            }
        }

        studentAnswer.setSelectedOption(option);
        if (request.getMarkedForReview() != null) {
            studentAnswer.setMarkedForReview(request.getMarkedForReview());
        }
        if (request.getVisited() != null) {
            studentAnswer.setVisited(request.getVisited());
        }
        studentAnswer.setAnsweredAt(now);

        studentAnswerRepository.save(studentAnswer);
    }

    @Transactional
    public SubmitAttemptResponse submitAttempt(Long attemptId, Long userId, boolean isAutoSubmit) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", "id", attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN, "Unauthorized submission attempt.");
        }

        // Idempotent: return existing result if already submitted
        if (attempt.getStatus() == AttemptStatus.SUBMITTED || attempt.getStatus() == AttemptStatus.AUTO_SUBMITTED) {
            Result existingResult = resultRepository.findByAttemptId(attemptId)
                    .orElseThrow(() -> new ApiException(ErrorCode.INTERNAL_ERROR, "Result not found for submitted attempt."));
            return mapToSubmitResponse(existingResult, attempt);
        }

        Instant now = clock.instant();

        // Load all answers
        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptIdOrderByPositionAsc(attemptId);
        int totalQuestions = answers.size();
        int correctCount = 0;
        int incorrectCount = 0;
        int unattemptedCount = 0;

        BigDecimal marksPerQ = attempt.getMarksPerQuestion();
        BigDecimal negMarks = attempt.getNegativeMarks();
        BigDecimal obtainedMarks = BigDecimal.ZERO;

        for (StudentAnswer sa : answers) {
            if (sa.getSelectedOption() == null) {
                unattemptedCount++;
            } else if (Boolean.TRUE.equals(sa.getSelectedOption().getIsCorrect())) {
                correctCount++;
                obtainedMarks = obtainedMarks.add(marksPerQ);
            } else {
                incorrectCount++;
                obtainedMarks = obtainedMarks.subtract(negMarks);
            }
        }

        // Score cannot be negative
        if (obtainedMarks.compareTo(BigDecimal.ZERO) < 0) {
            obtainedMarks = BigDecimal.ZERO;
        }

        BigDecimal totalMarks = attempt.getQuiz().getTotalMarks();
        if (totalMarks == null || totalMarks.compareTo(BigDecimal.ZERO) == 0) {
            totalMarks = marksPerQ.multiply(BigDecimal.valueOf(totalQuestions));
        }

        BigDecimal percentage = BigDecimal.ZERO;
        if (totalMarks.compareTo(BigDecimal.ZERO) > 0) {
            percentage = obtainedMarks.multiply(BigDecimal.valueOf(100))
                    .divide(totalMarks, 2, RoundingMode.HALF_UP);
            if (percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
                percentage = BigDecimal.valueOf(100);
            }
        }

        BigDecimal accuracy = BigDecimal.ZERO;
        int attemptedCount = correctCount + incorrectCount;
        if (attemptedCount > 0) {
            accuracy = BigDecimal.valueOf(correctCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(attemptedCount), 2, RoundingMode.HALF_UP);
        }

        long actualDurationSec = Duration.between(attempt.getStartedAt(), now).toSeconds();
        long maxDurationSec = attempt.getQuiz().getDurationMinutes() * 60L;
        int timeTakenSeconds = (int) Math.min(Math.max(0, actualDurationSec), maxDurationSec);

        // Update attempt status
        attempt.setStatus(isAutoSubmit ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(now);
        examAttemptRepository.save(attempt);

        // Create Result entity
        Result result = Result.builder()
                .attempt(attempt)
                .user(attempt.getUser())
                .quiz(attempt.getQuiz())
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .unattemptedCount(unattemptedCount)
                .totalMarks(totalMarks)
                .obtainedMarks(obtainedMarks)
                .percentage(percentage)
                .accuracy(accuracy)
                .timeTakenSeconds(timeTakenSeconds)
                .build();

        Result savedResult = resultRepository.save(result);
        return mapToSubmitResponse(savedResult, attempt);
    }

    private StartAttemptResponse buildStartAttemptResponse(ExamAttempt attempt, Instant now) {
        long remainingSec = Math.max(0, Duration.between(now, attempt.getExpiresAt()).toSeconds());

        List<StudentAnswer> studentAnswers = studentAnswerRepository.findByAttemptIdOrderByPositionAsc(attempt.getId());

        List<ExamQuestionDto> questionDtos = new ArrayList<>();
        List<StartAttemptResponse.StudentSavedAnswerDto> savedAnswerDtos = new ArrayList<>();

        for (StudentAnswer sa : studentAnswers) {
            Question q = sa.getQuestion();
            List<ExamQuestionDto.ExamOptionDto> optionDtos = q.getOptions().stream()
                    .sorted(Comparator.comparing(QuestionOption::getPosition))
                    .map(o -> ExamQuestionDto.ExamOptionDto.builder()
                            .id(o.getId())
                            .position(o.getPosition() != null ? o.getPosition().intValue() : 0)
                            .optionText(o.getOptionText())
                            .build())
                    .toList();

            questionDtos.add(ExamQuestionDto.builder()
                    .id(q.getId())
                    .position(sa.getPosition())
                    .questionText(q.getText())
                    .options(optionDtos)
                    .build());

            savedAnswerDtos.add(StartAttemptResponse.StudentSavedAnswerDto.builder()
                    .questionId(q.getId())
                    .selectedOptionId(sa.getSelectedOption() != null ? sa.getSelectedOption().getId() : null)
                    .markedForReview(sa.getMarkedForReview())
                    .visited(sa.getVisited())
                    .build());
        }

        return StartAttemptResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .durationMinutes(attempt.getQuiz().getDurationMinutes())
                .remainingSeconds(remainingSec)
                .serverTime(now)
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .totalQuestions(questionDtos.size())
                .marksPerQuestion(attempt.getMarksPerQuestion())
                .negativeMarks(attempt.getNegativeMarks())
                .questions(questionDtos)
                .savedAnswers(savedAnswerDtos)
                .build();
    }

    private SubmitAttemptResponse mapToSubmitResponse(Result result, ExamAttempt attempt) {
        return SubmitAttemptResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .status(attempt.getStatus())
                .totalQuestions(result.getTotalQuestions())
                .correctCount(result.getCorrectCount())
                .incorrectCount(result.getIncorrectCount())
                .unattemptedCount(result.getUnattemptedCount())
                .totalMarks(result.getTotalMarks())
                .obtainedMarks(result.getObtainedMarks())
                .percentage(result.getPercentage())
                .accuracy(result.getAccuracy())
                .timeTakenSeconds(result.getTimeTakenSeconds())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }
}
