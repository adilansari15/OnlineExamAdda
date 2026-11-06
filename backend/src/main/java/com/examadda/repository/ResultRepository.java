package com.examadda.repository;

import com.examadda.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    Optional<Result> findByAttemptId(Long attemptId);
    List<Result> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Result> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Result> findByQuizIdOrderByCreatedAtDesc(Long quizId);
    Page<Result> findByQuizIdOrderByCreatedAtDesc(Long quizId, Pageable pageable);
    Page<Result> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.user.id = :userId")
    Optional<Double> getAveragePercentageByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(r.accuracy) FROM Result r WHERE r.user.id = :userId")
    Optional<Double> getAverageAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(r.correctCount + r.incorrectCount) FROM Result r WHERE r.user.id = :userId")
    Optional<Long> getTotalQuestionsAttemptedByUserId(@Param("userId") Long userId);
}


