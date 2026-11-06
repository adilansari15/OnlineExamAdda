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
public class AttemptHistoryItemResponse {
    private Long attemptId;
    private Long resultId;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private Integer attemptNo;
    private AttemptStatus status;
    private BigDecimal totalMarks;
    private BigDecimal obtainedMarks;
    private BigDecimal percentage;
    private Integer timeTakenSeconds;
    private Instant startedAt;
    private Instant submittedAt;
}

