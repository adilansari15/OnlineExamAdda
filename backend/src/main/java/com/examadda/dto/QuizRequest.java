package com.examadda.dto;

import com.examadda.entity.Difficulty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class QuizRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    private String description;

    private String instructions;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Marks per question is required")
    @DecimalMin(value = "0.01", message = "Marks per question must be greater than 0")
    private BigDecimal marksPerQuestion;

    @Builder.Default
    @DecimalMin(value = "0.00", message = "Negative marks cannot be negative")
    private BigDecimal negativeMarks = BigDecimal.ZERO;

    private BigDecimal passingMarks;

    private Integer maxAttempts;

    private Instant startAt;

    private Instant endAt;
}

