package com.examadda.repository;

import com.examadda.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    List<Question> findBySubjectIdAndActiveTrue(Long subjectId);
    boolean existsBySubjectId(Long subjectId);
    long countBySubjectId(Long subjectId);
}

