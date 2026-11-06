package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "quizzes",
        indexes = {
                @Index(name = "idx_quizzes_cat_stat_diff", columnList = "category_id, status, difficulty"),
                @Index(name = "idx_quizzes_status_created", columnList = "status, created_at")
        }
)
public class Quiz extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "marks_per_question", nullable = false, precision = 5, scale = 2)
    private BigDecimal marksPerQuestion;

    @Builder.Default
    @Column(name = "negative_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal negativeMarks = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_marks", nullable = false, precision = 7, scale = 2)
    private BigDecimal totalMarks = BigDecimal.ZERO;

    @Column(name = "passing_marks", precision = 7, scale = 2)
    private BigDecimal passingMarks;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "start_at")
    private Instant startAt;

    @Column(name = "end_at")
    private Instant endAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private QuizStatus status = QuizStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Builder.Default
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> quizQuestions = new ArrayList<>();
}

