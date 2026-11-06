package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "questions",
        indexes = @Index(name = "idx_questions_subject_difficulty", columnList = "subject_id, difficulty")
)
public class Question extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionOption> options = new ArrayList<>();
}

