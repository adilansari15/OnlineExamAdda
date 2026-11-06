package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "results",
        indexes = {
                @Index(name = "idx_results_user_created", columnList = "user_id, created_at"),
                @Index(name = "idx_results_quiz", columnList = "quiz_id")
        }
)
public class Result extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false, unique = true)
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    @Column(name = "incorrect_count", nullable = false)
    private Integer incorrectCount;

    @Column(name = "unattempted_count", nullable = false)
    private Integer unattemptedCount;

    @Column(name = "total_marks", nullable = false, precision = 7, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "obtained_marks", nullable = false, precision = 7, scale = 2)
    private BigDecimal obtainedMarks;

    @Column(name = "percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "accuracy", nullable = false, precision = 5, scale = 2)
    private BigDecimal accuracy;

    @Column(name = "time_taken_seconds", nullable = false)
    private Integer timeTakenSeconds;
}

