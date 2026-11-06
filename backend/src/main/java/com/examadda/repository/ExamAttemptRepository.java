package com.examadda.repository;

import com.examadda.entity.AttemptStatus;
import com.examadda.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByUserIdAndQuizIdAndStatus(Long userId, Long quizId, AttemptStatus status);
    List<ExamAttempt> findByUserIdOrderByStartedAtDesc(Long userId);
    List<ExamAttempt> findByQuizId(Long quizId);
    boolean existsByQuizId(Long quizId);
    List<ExamAttempt> findByStatusAndExpiresAtBefore(AttemptStatus status, java.time.Instant threshold);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, AttemptStatus status);
    long countByQuizId(Long quizId);
    long countByUserIdAndQuizId(Long userId, Long quizId);
    List<ExamAttempt> findTop5ByUserIdOrderByStartedAtDesc(Long userId);
    List<ExamAttempt> findByUserIdAndStatus(Long userId, AttemptStatus status);

    @org.springframework.data.jpa.repository.Query(
            "SELECT COUNT(a) > 0 FROM ExamAttempt a JOIN QuizQuestion qq ON a.quiz.id = qq.id.quizId WHERE qq.id.questionId = :questionId"
    )
    boolean isQuestionUsedInQuizWithAttempts(@org.springframework.data.repository.query.Param("questionId") Long questionId);
}

