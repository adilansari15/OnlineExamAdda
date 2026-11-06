package com.examadda.dto;

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
public class StartAttemptResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer durationMinutes;
    private Long remainingSeconds;
    private Instant serverTime;
    private Instant startedAt;
    private Instant expiresAt;
    private Integer totalQuestions;
    private BigDecimal marksPerQuestion;
    private BigDecimal negativeMarks;
    private List<ExamQuestionDto> questions;
    private List<StudentSavedAnswerDto> savedAnswers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSavedAnswerDto {
        private Long questionId;
        private Long selectedOptionId;
        private Boolean markedForReview;
        private Boolean visited;
    }
}

