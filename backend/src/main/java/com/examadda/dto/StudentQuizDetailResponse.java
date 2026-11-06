package com.examadda.dto;

import com.examadda.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuizDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String instructions;
    private Long categoryId;
    private String categoryName;
    private Difficulty difficulty;
    private Integer questionCount;
    private Integer durationMinutes;
    private BigDecimal totalMarks;
    private BigDecimal marksPerQuestion;
    private BigDecimal negativeMarks;
    private Integer maxAttempts;
    private Instant startsAt;
    private Instant endsAt;
    private Long attemptsUsed;
    private Boolean canAttempt;
    private String cannotAttemptReason;
    private Long inProgressAttemptId;
}

