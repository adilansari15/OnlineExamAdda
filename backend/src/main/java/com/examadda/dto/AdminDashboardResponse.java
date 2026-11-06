package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalStudents;
    private long totalQuizzes;
    private long totalQuestions;
    private long totalAttempts;
    private long publishedQuizzes;
    private long draftQuizzes;
    private long activeCategories;
    private List<DashboardActivityItem> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardActivityItem {
        private String id;
        private String type; // 'STUDENT_REGISTERED', 'QUIZ_CREATED', 'ATTEMPT_SUBMITTED'
        private String title;
        private String description;
        private Instant timestamp;
    }
}

