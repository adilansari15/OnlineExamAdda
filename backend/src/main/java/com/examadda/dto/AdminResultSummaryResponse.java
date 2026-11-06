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
public class AdminResultSummaryResponse {
    private Long resultId;
    private Long attemptId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private AttemptStatus status;
    private BigDecimal totalMarks;
    private BigDecimal obtainedMarks;
    private BigDecimal percentage;
    private BigDecimal accuracy;
    private Integer timeTakenSeconds;
    private Instant submittedAt;
}

