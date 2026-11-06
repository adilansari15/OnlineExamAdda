package com.examadda.repository;

import com.examadda.entity.QuizQuestion;
import com.examadda.entity.QuizQuestionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, QuizQuestionId> {
    List<QuizQuestion> findByQuizIdOrderByPositionAsc(Long quizId);
    boolean existsByIdQuestionId(Long questionId);
    void deleteByQuizId(Long quizId);
    long countByQuizId(Long quizId);
}

