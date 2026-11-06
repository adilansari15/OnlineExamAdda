package com.examadda.service;

import com.examadda.dto.StudentDashboardResponse;
import com.examadda.dto.StudentQuizCardResponse;
import com.examadda.entity.AttemptStatus;
import com.examadda.entity.ExamAttempt;
import com.examadda.entity.Quiz;
import com.examadda.entity.QuizStatus;
import com.examadda.repository.ExamAttemptRepository;
import com.examadda.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StudentDashboardService {

    private final ExamAttemptRepository examAttemptRepository;
    private final QuizRepository quizRepository;
    private final StudentQuizService studentQuizService;
    private final Clock clock;

    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard(Long userId) {
        List<ExamAttempt> allAttempts = examAttemptRepository.findByUserIdOrderByStartedAtDesc(userId);

        long quizzesAttempted = allAttempts.size();
        BigDecimal averageScore = BigDecimal.ZERO;
        BigDecimal accuracyPercentage = BigDecimal.ZERO;
        long questionsAttempted = 0L;

        // Zero-safe calculations (results populated in Phase 5/6)
        StudentDashboardResponse.DashboardStats stats = StudentDashboardResponse.DashboardStats.builder()
                .quizzesAttempted(quizzesAttempted)
                .averageScore(averageScore)
                .accuracyPercentage(accuracyPercentage)
                .questionsAttempted(questionsAttempted)
                .build();

        // 1. Continue Learning: in-progress attempts + recent attempts
        List<StudentQuizCardResponse> continueLearning = new ArrayList<>();
        Set<Long> seenQuizIds = new HashSet<>();

        for (ExamAttempt attempt : allAttempts) {
            if (attempt.getStatus() == AttemptStatus.IN_PROGRESS && attempt.getQuiz().getStatus() == QuizStatus.PUBLISHED) {
                if (seenQuizIds.add(attempt.getQuiz().getId())) {
                    continueLearning.add(studentQuizService.mapToCardResponse(attempt.getQuiz()));
                }
            }
        }

        // 2. Recommended quizzes: published quizzes
        List<Quiz> publishedQuizzes = quizRepository.findTop6ByStatusOrderByCreatedAtDesc(QuizStatus.PUBLISHED);
        List<StudentQuizCardResponse> recommended = new ArrayList<>();
        for (Quiz q : publishedQuizzes) {
            if (!seenQuizIds.contains(q.getId())) {
                recommended.add(studentQuizService.mapToCardResponse(q));
            }
        }

        // 3. Upcoming exams: published quizzes with future startsAt
        Instant now = clock.instant();
        List<Quiz> upcoming = quizRepository.findByStatusAndStartAtAfterOrderByStartAtAsc(QuizStatus.PUBLISHED, now);
        List<StudentQuizCardResponse> upcomingCards = upcoming.stream()
                .map(studentQuizService::mapToCardResponse)
                .toList();

        // 4. Recent activity: attempt activities
        List<StudentDashboardResponse.StudentActivityItem> activityItems = new ArrayList<>();
        List<ExamAttempt> recentAttempts = examAttemptRepository.findTop5ByUserIdOrderByStartedAtDesc(userId);
        for (ExamAttempt a : recentAttempts) {
            activityItems.add(StudentDashboardResponse.StudentActivityItem.builder()
                    .id("attempt-" + a.getId())
                    .type(a.getStatus() == AttemptStatus.IN_PROGRESS ? "ATTEMPT_STARTED" : "ATTEMPT_COMPLETED")
                    .title(a.getStatus() == AttemptStatus.IN_PROGRESS ? "Exam In Progress" : "Exam Submitted")
                    .description("Quiz: " + a.getQuiz().getTitle() + " (" + a.getStatus() + ")")
                    .timestamp(a.getStartedAt())
                    .build());
        }

        return StudentDashboardResponse.builder()
                .stats(stats)
                .continueLearning(continueLearning)
                .recommendedQuizzes(recommended)
                .upcomingExams(upcomingCards)
                .recentActivity(activityItems)
                .build();
    }
}
