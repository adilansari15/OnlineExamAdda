package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {
    private DashboardStats stats;
    private List<StudentQuizCardResponse> continueLearning;
    private List<StudentQuizCardResponse> recommendedQuizzes;
    private List<StudentQuizCardResponse> upcomingExams;
    private List<StudentActivityItem> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private Long quizzesAttempted;
        private BigDecimal averageScore;
        private BigDecimal accuracyPercentage;
        private Long questionsAttempted;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentActivityItem {
        private String id;
        private String type; // ATTEMPT_STARTED, ATTEMPT_COMPLETED
        private String title;
        private String description;
        private Instant timestamp;
    }
}

