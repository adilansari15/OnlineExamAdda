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
        name = "exam_attempts",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_quiz_attempt", columnNames = {"user_id", "quiz_id", "attempt_no"}),
        indexes = {
                @Index(name = "idx_attempts_user_started", columnList = "user_id, started_at"),
                @Index(name = "idx_attempts_status_expires", columnList = "status, expires_at"),
                @Index(name = "idx_attempts_quiz", columnList = "quiz_id")
        }
)
public class ExamAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "marks_per_question", nullable = false, precision = 5, scale = 2)
    private BigDecimal marksPerQuestion;

    @Column(name = "negative_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal negativeMarks;

    @Builder.Default
    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentAnswer> answers = new ArrayList<>();

    @OneToOne(mappedBy = "attempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Result result;
}

