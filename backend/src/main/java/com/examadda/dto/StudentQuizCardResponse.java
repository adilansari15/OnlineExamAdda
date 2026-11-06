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
public class StudentQuizCardResponse {
    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Difficulty difficulty;
    private Integer questionCount;
    private Integer durationMinutes;
    private BigDecimal totalMarks;
    private Boolean hasNegativeMarking;
    private BigDecimal negativeMarks;
    private Long attemptCount;
    private Instant startsAt;
    private Instant endsAt;
}

