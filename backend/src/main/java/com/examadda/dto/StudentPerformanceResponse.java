package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPerformanceResponse {
    private Long totalAttempts;
    private BigDecimal averagePercentage;
    private BigDecimal overallAccuracy;
    private Long totalQuestionsAttempted;
    private List<CategoryMasteryDto> categoryMastery;
    private List<AttemptScoreTrendDto> scoreTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryMasteryDto {
        private Long categoryId;
        private String categoryName;
        private Long attemptsCount;
        private BigDecimal averageScore;
        private BigDecimal accuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptScoreTrendDto {
        private Long attemptId;
        private String quizTitle;
        private BigDecimal percentage;
        private String date;
    }
}

