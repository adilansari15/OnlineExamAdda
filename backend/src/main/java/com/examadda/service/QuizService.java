package com.examadda.service;

import com.examadda.dto.*;
import com.examadda.entity.*;
import com.examadda.exception.ApiException;
import com.examadda.exception.ErrorCode;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<QuizResponse> getAdminQuizzes(
            String q,
            Long categoryId,
            QuizStatus status,
            Difficulty difficulty,
            Pageable pageable) {

        Specification<Quiz> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + q.trim().toLowerCase() + "%"));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<QuizResponse> page = quizRepository.findAll(spec, pageable)
                .map(quiz -> mapToResponse(quiz, false));

        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuizById(Long id) {
        Quiz quiz = findQuizEntity(id);
        return mapToResponse(quiz, true);
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest request, String userEmail) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        validateWindow(request);

        User createdBy = null;
        if (userEmail != null) {
            createdBy = userRepository.findByEmail(userEmail).orElse(null);
        }

        Quiz quiz = Quiz.builder()
                .category(category)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .instructions(request.getInstructions())
                .difficulty(request.getDifficulty())
                .durationMinutes(request.getDurationMinutes())
                .marksPerQuestion(request.getMarksPerQuestion())
                .negativeMarks(request.getNegativeMarks() != null ? request.getNegativeMarks() : BigDecimal.ZERO)
                .totalMarks(BigDecimal.ZERO)
                .passingMarks(request.getPassingMarks())
                .maxAttempts(request.getMaxAttempts())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .status(QuizStatus.DRAFT)
                .createdBy(createdBy)
                .build();

        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved, true);
    }

    @Transactional
    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = findQuizEntity(id);
        validateWindow(request);

        boolean hasAttempts = examAttemptRepository.existsByQuizId(id);
        if (hasAttempts) {
            boolean marksChanged = quiz.getMarksPerQuestion().compareTo(request.getMarksPerQuestion()) != 0;
            BigDecimal reqNeg = request.getNegativeMarks() != null ? request.getNegativeMarks() : BigDecimal.ZERO;
            boolean negChanged = quiz.getNegativeMarks().compareTo(reqNeg) != 0;

            if (marksChanged || negChanged) {
                throw new ApiException(ErrorCode.QUIZ_LOCKED, "Cannot change marking scheme for a quiz that has existing attempts");
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        quiz.setCategory(category);
        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setInstructions(request.getInstructions());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setMarksPerQuestion(request.getMarksPerQuestion());
        quiz.setNegativeMarks(request.getNegativeMarks() != null ? request.getNegativeMarks() : BigDecimal.ZERO);
        quiz.setPassingMarks(request.getPassingMarks());
        quiz.setMaxAttempts(request.getMaxAttempts());
        quiz.setStartAt(request.getStartAt());
        quiz.setEndAt(request.getEndAt());

        // Recompute total marks if no attempts and marks per question changed
        if (!hasAttempts && !quiz.getQuizQuestions().isEmpty()) {
            recalculateTotalMarks(quiz);
        }

        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved, true);
    }

    @Transactional
    public QuizResponse assignQuestions(Long id, QuizQuestionsAssignRequest request) {
        Quiz quiz = findQuizEntity(id);

        if (examAttemptRepository.existsByQuizId(id)) {
            throw new ApiException(ErrorCode.QUIZ_LOCKED, "Cannot modify questions for a quiz that has existing attempts");
        }

        quiz.getQuizQuestions().clear();

        BigDecimal total = BigDecimal.ZERO;
        List<QuizQuestionItemRequest> items = request.getQuestions() != null ? request.getQuestions() : List.of();

        for (int i = 0; i < items.size(); i++) {
            QuizQuestionItemRequest item = items.get(i);
            Question question = questionRepository.findById(item.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question", "id", item.getQuestionId()));

            BigDecimal effectiveMarks = item.getMarksOverride() != null ? item.getMarksOverride() : quiz.getMarksPerQuestion();
            total = total.add(effectiveMarks);

            QuizQuestion qq = QuizQuestion.builder()
                    .id(new QuizQuestionId(quiz.getId(), question.getId()))
                    .quiz(quiz)
                    .question(question)
                    .position(i + 1)
                    .marksOverride(item.getMarksOverride())
                    .negativeOverride(item.getNegativeOverride())
                    .build();

            quiz.getQuizQuestions().add(qq);
        }

        quiz.setTotalMarks(total);
        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved, true);
    }

    @Transactional
    public QuizResponse publishQuiz(Long id) {
        Quiz quiz = findQuizEntity(id);

        if (quiz.getQuizQuestions().isEmpty()) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Quiz must have at least 1 question assigned before publishing");
        }

        if (quiz.getDurationMinutes() == null || quiz.getDurationMinutes() <= 0) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Quiz duration must be greater than 0 minutes");
        }

        if (quiz.getStartAt() != null && quiz.getEndAt() != null && !quiz.getEndAt().isAfter(quiz.getStartAt())) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Quiz end time must be after start time");
        }

        quiz.setStatus(QuizStatus.PUBLISHED);
        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved, true);
    }

    @Transactional
    public QuizResponse unpublishQuiz(Long id) {
        Quiz quiz = findQuizEntity(id);
        quiz.setStatus(QuizStatus.DRAFT);
        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved, true);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = findQuizEntity(id);

        if (examAttemptRepository.existsByQuizId(id)) {
            throw new ApiException(ErrorCode.QUIZ_LOCKED, "Cannot delete a quiz that has existing attempts. Archive it instead.");
        }

        quizRepository.delete(quiz);
    }

    private void validateWindow(QuizRequest request) {
        if (request.getStartAt() != null && request.getEndAt() != null) {
            if (!request.getEndAt().isAfter(request.getStartAt())) {
                throw new ApiException(ErrorCode.VALIDATION_FAILED, "Quiz end time must be after start time");
            }
        }
    }

    private void recalculateTotalMarks(Quiz quiz) {
        BigDecimal total = BigDecimal.ZERO;
        for (QuizQuestion qq : quiz.getQuizQuestions()) {
            BigDecimal marks = qq.getMarksOverride() != null ? qq.getMarksOverride() : quiz.getMarksPerQuestion();
            total = total.add(marks);
        }
        quiz.setTotalMarks(total);
    }

    private Quiz findQuizEntity(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
    }

    private QuizResponse mapToResponse(Quiz quiz, boolean includeQuestions) {
        boolean hasAttempts = examAttemptRepository.existsByQuizId(quiz.getId());

        List<QuizQuestionResponse> questionResponses = null;
        if (includeQuestions && quiz.getQuizQuestions() != null) {
            questionResponses = quiz.getQuizQuestions().stream()
                    .sorted(Comparator.comparing(QuizQuestion::getPosition))
                    .map(qq -> QuizQuestionResponse.builder()
                            .questionId(qq.getQuestion().getId())
                            .position(qq.getPosition())
                            .text(qq.getQuestion().getText())
                            .difficulty(qq.getQuestion().getDifficulty())
                            .subjectName(qq.getQuestion().getSubject().getName())
                            .marksOverride(qq.getMarksOverride())
                            .negativeOverride(qq.getNegativeOverride())
                            .effectiveMarks(qq.getMarksOverride() != null ? qq.getMarksOverride() : quiz.getMarksPerQuestion())
                            .effectiveNegativeMarks(qq.getNegativeOverride() != null ? qq.getNegativeOverride() : quiz.getNegativeMarks())
                            .build())
                    .toList();
        }

        return QuizResponse.builder()
                .id(quiz.getId())
                .categoryId(quiz.getCategory().getId())
                .categoryName(quiz.getCategory().getName())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .instructions(quiz.getInstructions())
                .difficulty(quiz.getDifficulty())
                .durationMinutes(quiz.getDurationMinutes())
                .marksPerQuestion(quiz.getMarksPerQuestion())
                .negativeMarks(quiz.getNegativeMarks())
                .totalMarks(quiz.getTotalMarks())
                .passingMarks(quiz.getPassingMarks())
                .maxAttempts(quiz.getMaxAttempts())
                .startAt(quiz.getStartAt())
                .endAt(quiz.getEndAt())
                .status(quiz.getStatus())
                .questionCount(quiz.getQuizQuestions() != null ? quiz.getQuizQuestions().size() : 0)
                .hasAttempts(hasAttempts)
                .questions(questionResponses)
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }
}

