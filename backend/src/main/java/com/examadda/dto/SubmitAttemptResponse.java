package com.examadda.dto;

import com.examadda.entity.AttemptStatus;
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
public class SubmitAttemptResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private AttemptStatus status;
    private Integer totalQuestions;
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer unattemptedCount;
    private BigDecimal totalMarks;
    private BigDecimal obtainedMarks;
    private BigDecimal percentage;
    private BigDecimal accuracy;
    private Integer timeTakenSeconds;
    private Instant submittedAt;
}

