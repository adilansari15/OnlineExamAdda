package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "question_options",
        uniqueConstraints = @UniqueConstraint(name = "uq_question_option_pos", columnNames = {"question_id", "position"})
)
public class QuestionOption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Builder.Default
    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @Column(name = "position", nullable = false)
    private Byte position;
}

