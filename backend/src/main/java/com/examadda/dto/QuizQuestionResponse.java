package com.examadda.dto;

import com.examadda.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long questionId;
    private Integer position;
    private String text;
    private Difficulty difficulty;
    private String subjectName;
    private BigDecimal marksOverride;
    private BigDecimal negativeOverride;
    private BigDecimal effectiveMarks;
    private BigDecimal effectiveNegativeMarks;
}

