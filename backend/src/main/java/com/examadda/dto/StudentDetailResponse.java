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
public class StudentDetailResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Boolean enabled;
    private long totalAttempts;
    private long completedAttempts;
    private BigDecimal averageScore;
    private List<StudentRecentAttemptItem> recentAttempts;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRecentAttemptItem {
        private Long attemptId;
        private Long quizId;
        private String quizTitle;
        private String status;
        private BigDecimal obtainedMarks;
        private BigDecimal totalMarks;
        private BigDecimal percentage;
        private Instant startedAt;
        private Instant submittedAt;
    }
}

