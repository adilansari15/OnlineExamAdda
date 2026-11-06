package com.examadda.dto;

import com.examadda.entity.Difficulty;
import com.examadda.entity.QuizStatus;
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
public class QuizResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String description;
    private String instructions;
    private Difficulty difficulty;
    private Integer durationMinutes;
    private BigDecimal marksPerQuestion;
    private BigDecimal negativeMarks;
    private BigDecimal totalMarks;
    private BigDecimal passingMarks;
    private Integer maxAttempts;
    private Instant startAt;
    private Instant endAt;
    private QuizStatus status;
    private int questionCount;
    private boolean hasAttempts;
    private List<QuizQuestionResponse> questions;
    private Instant createdAt;
    private Instant updatedAt;
}

