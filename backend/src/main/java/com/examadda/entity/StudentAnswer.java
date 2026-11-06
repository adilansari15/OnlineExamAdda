package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "student_answers",
        uniqueConstraints = @UniqueConstraint(name = "uq_attempt_question", columnNames = {"attempt_id", "question_id"}),
        indexes = @Index(name = "idx_answers_attempt", columnList = "attempt_id")
)
public class StudentAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "position", nullable = false)
    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;

    @Builder.Default
    @Column(name = "visited", nullable = false)
    private Boolean visited = false;

    @Builder.Default
    @Column(name = "marked_for_review", nullable = false)
    private Boolean markedForReview = false;

    @Column(name = "answered_at")
    private Instant answeredAt;
}

