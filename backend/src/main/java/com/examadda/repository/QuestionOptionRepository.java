package com.examadda.repository;

import com.examadda.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestionIdOrderByPositionAsc(Long questionId);
}

