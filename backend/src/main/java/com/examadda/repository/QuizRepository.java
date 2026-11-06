package com.examadda.repository;

import com.examadda.entity.Quiz;
import com.examadda.entity.QuizStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long>, JpaSpecificationExecutor<Quiz> {
    List<Quiz> findByStatus(QuizStatus status);
    java.util.Optional<Quiz> findByIdAndStatus(Long id, QuizStatus status);
    boolean existsByCategoryId(Long categoryId);
    long countByStatus(QuizStatus status);
    List<Quiz> findTop5ByOrderByCreatedAtDesc();
    List<Quiz> findTop6ByStatusOrderByCreatedAtDesc(QuizStatus status);
    List<Quiz> findByStatusAndStartAtAfterOrderByStartAtAsc(QuizStatus status, java.time.Instant now);
}

