package com.examadda.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionItemRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private BigDecimal marksOverride;

    private BigDecimal negativeOverride;
}

