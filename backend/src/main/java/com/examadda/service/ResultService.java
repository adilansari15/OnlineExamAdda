package com.examadda.service;

import com.examadda.dto.*;
import com.examadda.entity.*;
import com.examadda.exception.ApiException;
import com.examadda.exception.ErrorCode;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository resultRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ResultDetailResponse getResultDetail(Long attemptId, Long userId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", "id", attemptId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> RoleType.ROLE_ADMIN.name().equals(r.getName()));

        if (!isAdmin && !attempt.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN, "Unauthorized access to exam result.");
        }

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new ApiException(ErrorCode.FORBIDDEN, "Exam result cannot be viewed while examination is still in progress.");
        }

        Result result = resultRepository.findByAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result", "attemptId", attemptId));

        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptIdOrderByPositionAsc(attemptId);
        List<ResultDetailResponse.QuestionReviewDto> questionReviews = new ArrayList<>();

        BigDecimal marksPerQ = attempt.getMarksPerQuestion();
        BigDecimal negMarks = attempt.getNegativeMarks();

        for (StudentAnswer sa : answers) {
            Question q = sa.getQuestion();
            Long selectedOptionId = sa.getSelectedOption() != null ? sa.getSelectedOption().getId() : null;

            Long correctOptionId = null;
            List<ResultDetailResponse.OptionReviewDto> optionReviews = new ArrayList<>();

            for (QuestionOption opt : q.getOptions()) {
                if (Boolean.TRUE.equals(opt.getIsCorrect())) {
                    correctOptionId = opt.getId();
                }
                optionReviews.add(ResultDetailResponse.OptionReviewDto.builder()
                        .id(opt.getId())
                        .position(opt.getPosition() != null ? opt.getPosition().intValue() : 0)
                        .optionText(opt.getOptionText())
                        .isCorrect(opt.getIsCorrect())
                        .build());
            }
            optionReviews.sort(Comparator.comparing(ResultDetailResponse.OptionReviewDto::getPosition));

            boolean isCorrect = selectedOptionId != null && selectedOptionId.equals(correctOptionId);
            BigDecimal marksAwarded = BigDecimal.ZERO;
            if (selectedOptionId != null) {
                marksAwarded = isCorrect ? marksPerQ : negMarks.negate();
            }

            questionReviews.add(ResultDetailResponse.QuestionReviewDto.builder()
                    .questionId(q.getId())
                    .position(sa.getPosition())
                    .questionText(q.getText())
                    .explanation(q.getExplanation())
                    .studentSelectedOptionId(selectedOptionId)
                    .correctOptionId(correctOptionId)
                    .isCorrect(isCorrect)
                    .marksAwarded(marksAwarded)
                    .options(optionReviews)
                    .build());
        }

        return ResultDetailResponse.builder()
                .resultId(result.getId())
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .categoryName(attempt.getQuiz().getCategory().getName())
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
                .questions(questionReviews)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<AttemptHistoryItemResponse> getMyAttempts(Long userId, Pageable pageable) {
        Page<Result> page = resultRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        Page<AttemptHistoryItemResponse> mapped = page.map(r -> AttemptHistoryItemResponse.builder()
                .attemptId(r.getAttempt().getId())
                .resultId(r.getId())
                .quizId(r.getQuiz().getId())
                .quizTitle(r.getQuiz().getTitle())
                .categoryName(r.getQuiz().getCategory().getName())
                .attemptNo(r.getAttempt().getAttemptNo())
                .status(r.getAttempt().getStatus())
                .totalMarks(r.getTotalMarks())
                .obtainedMarks(r.getObtainedMarks())
                .percentage(r.getPercentage())
                .timeTakenSeconds(r.getTimeTakenSeconds())
                .startedAt(r.getAttempt().getStartedAt())
                .submittedAt(r.getAttempt().getSubmittedAt())
                .build());

        return PageResponse.from(mapped);
    }

    @Transactional(readOnly = true)
    public StudentPerformanceResponse getStudentPerformance(Long userId) {
        List<Result> results = resultRepository.findByUserIdOrderByCreatedAtDesc(userId);

        long totalAttempts = results.size();
        Double avgPercentage = resultRepository.getAveragePercentageByUserId(userId).orElse(0.0);
        Double avgAccuracy = resultRepository.getAverageAccuracyByUserId(userId).orElse(0.0);
        Long totalQuestions = resultRepository.getTotalQuestionsAttemptedByUserId(userId).orElse(0L);

        // Group by category for mastery
        Map<Long, List<Result>> byCategory = new HashMap<>();
        for (Result r : results) {
            byCategory.computeIfAbsent(r.getQuiz().getCategory().getId(), k -> new ArrayList<>()).add(r);
        }

        List<StudentPerformanceResponse.CategoryMasteryDto> masteryList = new ArrayList<>();
        for (Map.Entry<Long, List<Result>> entry : byCategory.entrySet()) {
            List<Result> catResults = entry.getValue();
            String catName = catResults.get(0).getQuiz().getCategory().getName();

            double catScoreSum = 0;
            double catAccuracySum = 0;
            for (Result cr : catResults) {
                catScoreSum += cr.getPercentage().doubleValue();
                catAccuracySum += cr.getAccuracy().doubleValue();
            }

            masteryList.add(StudentPerformanceResponse.CategoryMasteryDto.builder()
                    .categoryId(entry.getKey())
                    .categoryName(catName)
                    .attemptsCount((long) catResults.size())
                    .averageScore(BigDecimal.valueOf(catScoreSum / catResults.size()).setScale(2, RoundingMode.HALF_UP))
                    .accuracy(BigDecimal.valueOf(catAccuracySum / catResults.size()).setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        // Recent score trend
        List<StudentPerformanceResponse.AttemptScoreTrendDto> trends = results.stream()
                .limit(10)
                .map(r -> StudentPerformanceResponse.AttemptScoreTrendDto.builder()
                        .attemptId(r.getAttempt().getId())
                        .quizTitle(r.getQuiz().getTitle())
                        .percentage(r.getPercentage())
                        .date(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "")
                        .build())
                .toList();

        return StudentPerformanceResponse.builder()
                .totalAttempts(totalAttempts)
                .averagePercentage(BigDecimal.valueOf(avgPercentage).setScale(2, RoundingMode.HALF_UP))
                .overallAccuracy(BigDecimal.valueOf(avgAccuracy).setScale(2, RoundingMode.HALF_UP))
                .totalQuestionsAttempted(totalQuestions)
                .categoryMastery(masteryList)
                .scoreTrends(trends)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminResultSummaryResponse> getAdminResults(Long quizId, Pageable pageable) {
        Page<Result> page;
        if (quizId != null) {
            page = resultRepository.findByQuizIdOrderByCreatedAtDesc(quizId, pageable);
        } else {
            page = resultRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        Page<AdminResultSummaryResponse> mapped = page.map(r -> AdminResultSummaryResponse.builder()
                .resultId(r.getId())
                .attemptId(r.getAttempt().getId())
                .studentId(r.getUser().getId())
                .studentName(r.getUser().getFullName())
                .studentEmail(r.getUser().getEmail())
                .quizId(r.getQuiz().getId())
                .quizTitle(r.getQuiz().getTitle())
                .categoryName(r.getQuiz().getCategory().getName())
                .status(r.getAttempt().getStatus())
                .totalMarks(r.getTotalMarks())
                .obtainedMarks(r.getObtainedMarks())
                .percentage(r.getPercentage())
                .accuracy(r.getAccuracy())
                .timeTakenSeconds(r.getTimeTakenSeconds())
                .submittedAt(r.getAttempt().getSubmittedAt())
                .build());

        return PageResponse.from(mapped);
    }
}
