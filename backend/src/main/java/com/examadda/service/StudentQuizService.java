package com.examadda.service;

import com.examadda.dto.PageResponse;
import com.examadda.dto.StudentQuizCardResponse;
import com.examadda.dto.StudentQuizDetailResponse;
import com.examadda.entity.AttemptStatus;
import com.examadda.entity.Difficulty;
import com.examadda.entity.ExamAttempt;
import com.examadda.entity.Quiz;
import com.examadda.entity.QuizStatus;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.ExamAttemptRepository;
import com.examadda.repository.QuizRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentQuizService {

    private final QuizRepository quizRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public PageResponse<StudentQuizCardResponse> getPublishedQuizzes(
            String q,
            Long categoryId,
            Difficulty difficulty,
            String sortOption,
            Pageable pageable
    ) {
        // Enforce max page size of 50 per spec
        int size = Math.min(pageable.getPageSize(), 50);

        // Determine sorting
        Sort sort;
        if ("title".equalsIgnoreCase(sortOption)) {
            sort = Sort.by(Sort.Direction.ASC, "title");
        } else if ("duration".equalsIgnoreCase(sortOption)) {
            sort = Sort.by(Sort.Direction.ASC, "durationMinutes");
        } else if ("difficulty".equalsIgnoreCase(sortOption)) {
            sort = Sort.by(Sort.Direction.ASC, "difficulty");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable effectivePageable = PageRequest.of(pageable.getPageNumber(), size, sort);

        Specification<Quiz> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always enforce PUBLISHED status only
            predicates.add(cb.equal(root.get("status"), QuizStatus.PUBLISHED));

            if (q != null && !q.isBlank()) {
                String search = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), search),
                        cb.like(cb.lower(root.get("description")), search)
                ));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StudentQuizCardResponse> page = quizRepository.findAll(spec, effectivePageable)
                .map(this::mapToCardResponse);

        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public StudentQuizDetailResponse getPublishedQuizById(Long id, Long currentUserId) {
        Quiz quiz = quizRepository.findByIdAndStatus(id, QuizStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));

        long attemptsUsed = currentUserId != null
                ? examAttemptRepository.countByUserIdAndQuizId(currentUserId, id)
                : 0L;

        Optional<ExamAttempt> inProgressOpt = currentUserId != null
                ? examAttemptRepository.findByUserIdAndQuizIdAndStatus(currentUserId, id, AttemptStatus.IN_PROGRESS)
                : Optional.empty();

        Instant now = clock.instant();
        boolean canAttempt = true;
        String cannotAttemptReason = null;
        Long inProgressAttemptId = null;

        if (inProgressOpt.isPresent()) {
            canAttempt = true;
            inProgressAttemptId = inProgressOpt.get().getId();
            cannotAttemptReason = "You have an ongoing attempt. Click Start to resume.";
        } else if (quiz.getStartAt() != null && now.isBefore(quiz.getStartAt())) {
            canAttempt = false;
            cannotAttemptReason = "Quiz has not started yet. Schedule starts at " + quiz.getStartAt();
        } else if (quiz.getEndAt() != null && now.isAfter(quiz.getEndAt())) {
            canAttempt = false;
            cannotAttemptReason = "Quiz deadline has passed";
        } else if (quiz.getMaxAttempts() != null && quiz.getMaxAttempts() > 0 && attemptsUsed >= quiz.getMaxAttempts()) {
            canAttempt = false;
            cannotAttemptReason = "Maximum attempt limit reached (" + quiz.getMaxAttempts() + "/" + quiz.getMaxAttempts() + ")";
        }

        return StudentQuizDetailResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .instructions(quiz.getInstructions())
                .categoryId(quiz.getCategory().getId())
                .categoryName(quiz.getCategory().getName())
                .difficulty(quiz.getDifficulty())
                .questionCount(quiz.getQuizQuestions().size())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .marksPerQuestion(quiz.getMarksPerQuestion())
                .negativeMarks(quiz.getNegativeMarks())
                .maxAttempts(quiz.getMaxAttempts())
                .startsAt(quiz.getStartAt())
                .endsAt(quiz.getEndAt())
                .attemptsUsed(attemptsUsed)
                .canAttempt(canAttempt)
                .cannotAttemptReason(cannotAttemptReason)
                .inProgressAttemptId(inProgressAttemptId)
                .build();
    }

    public StudentQuizCardResponse mapToCardResponse(Quiz quiz) {
        long attemptsCount = examAttemptRepository.countByQuizId(quiz.getId());
        boolean hasNegative = quiz.getNegativeMarks() != null && quiz.getNegativeMarks().compareTo(BigDecimal.ZERO) > 0;

        return StudentQuizCardResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .categoryId(quiz.getCategory().getId())
                .categoryName(quiz.getCategory().getName())
                .difficulty(quiz.getDifficulty())
                .questionCount(quiz.getQuizQuestions().size())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .hasNegativeMarking(hasNegative)
                .negativeMarks(quiz.getNegativeMarks())
                .attemptCount(attemptsCount)
                .startsAt(quiz.getStartAt())
                .endsAt(quiz.getEndAt())
                .build();
    }
}
