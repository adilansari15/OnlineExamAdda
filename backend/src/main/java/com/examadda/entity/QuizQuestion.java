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
        name = "quiz_questions",
        uniqueConstraints = @UniqueConstraint(name = "uq_quiz_questions_pos", columnNames = {"quiz_id", "position"})
)
public class QuizQuestion {

    @EmbeddedId
    private QuizQuestionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("quizId")
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("questionId")
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Column(name = "marks_override", precision = 5, scale = 2)
    private BigDecimal marksOverride;

    @Column(name = "negative_override", precision = 5, scale = 2)
    private BigDecimal negativeOverride;
}

