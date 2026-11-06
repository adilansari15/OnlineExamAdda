package com.examadda.dto;

import com.examadda.entity.AttemptStatus;
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
public class ResultDetailResponse {
    private Long resultId;
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
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
    private List<QuestionReviewDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionReviewDto {
        private Long questionId;
        private Integer position;
        private String questionText;
        private String explanation;
        private Long studentSelectedOptionId;
        private Long correctOptionId;
        private Boolean isCorrect;
        private BigDecimal marksAwarded;
        private List<OptionReviewDto> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionReviewDto {
        private Long id;
        private Integer position;
        private String optionText;
        private Boolean isCorrect;
    }
}

