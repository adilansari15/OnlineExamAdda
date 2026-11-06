package com.examadda.service;

import com.examadda.dto.OptionRequest;
import com.examadda.dto.OptionResponse;
import com.examadda.dto.PageResponse;
import com.examadda.dto.QuestionRequest;
import com.examadda.dto.QuestionResponse;
import com.examadda.entity.Difficulty;
import com.examadda.entity.Question;
import com.examadda.entity.QuestionOption;
import com.examadda.entity.Subject;
import com.examadda.entity.User;
import com.examadda.exception.ApiException;
import com.examadda.exception.ConflictException;
import com.examadda.exception.ErrorCode;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.ExamAttemptRepository;
import com.examadda.repository.QuestionRepository;
import com.examadda.repository.QuizQuestionRepository;
import com.examadda.repository.SubjectRepository;
import com.examadda.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ExamAttemptRepository examAttemptRepository;

    @Transactional(readOnly = true)
    public PageResponse<QuestionResponse> getQuestions(
            String q,
            Long subjectId,
            Difficulty difficulty,
            Pageable pageable) {

        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("text")), "%" + q.trim().toLowerCase() + "%"));
            }

            if (subjectId != null) {
                predicates.add(cb.equal(root.get("subject").get("id"), subjectId));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<QuestionResponse> page = questionRepository.findAll(spec, pageable)
                .map(this::mapToResponse);

        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long id) {
        Question question = findQuestionEntity(id);
        return mapToResponse(question);
    }

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request, String userEmail) {
        validateOptions(request.getOptions());

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        User createdBy = null;
        if (userEmail != null) {
            createdBy = userRepository.findByEmail(userEmail).orElse(null);
        }

        Question question = Question.builder()
                .subject(subject)
                .text(request.getText().trim())
                .explanation(request.getExplanation() != null ? request.getExplanation().trim() : null)
                .difficulty(request.getDifficulty())
                .active(request.getActive() != null ? request.getActive() : true)
                .createdBy(createdBy)
                .build();

        for (int i = 0; i < request.getOptions().size(); i++) {
            OptionRequest optReq = request.getOptions().get(i);
            byte pos = optReq.getPosition() != null ? optReq.getPosition() : (byte) (i + 1);

            QuestionOption option = QuestionOption.builder()
                    .question(question)
                    .optionText(optReq.getOptionText().trim())
                    .isCorrect(Boolean.TRUE.equals(optReq.getIsCorrect()))
                    .position(pos)
                    .build();

            question.getOptions().add(option);
        }

        Question saved = questionRepository.save(question);
        return mapToResponse(saved);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = findQuestionEntity(id);
        validateOptions(request.getOptions());

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        boolean isLockedInAttempt = examAttemptRepository.isQuestionUsedInQuizWithAttempts(id);
        if (isLockedInAttempt) {
            // Find existing correct option
            Optional<QuestionOption> currentCorrectOpt = question.getOptions().stream()
                    .filter(QuestionOption::getIsCorrect)
                    .findFirst();

            Optional<OptionRequest> newCorrectOpt = request.getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .findFirst();

            if (currentCorrectOpt.isPresent() && newCorrectOpt.isPresent()) {
                QuestionOption curr = currentCorrectOpt.get();
                OptionRequest next = newCorrectOpt.get();

                // If position or text of the correct option changed, reject
                boolean positionChanged = next.getPosition() != null && !Objects.equals(curr.getPosition(), next.getPosition());
                boolean textChanged = !curr.getOptionText().equalsIgnoreCase(next.getOptionText().trim());

                if (positionChanged || textChanged) {
                    throw new ApiException(ErrorCode.QUIZ_LOCKED, "Cannot change the answer key of a question used in a quiz that already has attempts");
                }
            }
        }

        question.setSubject(subject);
        question.setText(request.getText().trim());
        question.setExplanation(request.getExplanation() != null ? request.getExplanation().trim() : null);
        question.setDifficulty(request.getDifficulty());
        if (request.getActive() != null) {
            question.setActive(request.getActive());
        }

        // Update options
        question.getOptions().clear();
        for (int i = 0; i < request.getOptions().size(); i++) {
            OptionRequest optReq = request.getOptions().get(i);
            byte pos = optReq.getPosition() != null ? optReq.getPosition() : (byte) (i + 1);

            QuestionOption option = QuestionOption.builder()
                    .question(question)
                    .optionText(optReq.getOptionText().trim())
                    .isCorrect(Boolean.TRUE.equals(optReq.getIsCorrect()))
                    .position(pos)
                    .build();

            question.getOptions().add(option);
        }

        Question saved = questionRepository.save(question);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = findQuestionEntity(id);

        if (examAttemptRepository.isQuestionUsedInQuizWithAttempts(id)) {
            throw new ApiException(ErrorCode.QUIZ_LOCKED, "Cannot delete a question used in a quiz that already has attempts");
        }

        if (quizQuestionRepository.existsByIdQuestionId(id)) {
            throw new ConflictException("Cannot delete question '" + question.getText() + "' because it is included in existing quizzes");
        }

        questionRepository.delete(question);
    }

    private void validateOptions(List<OptionRequest> options) {
        if (options == null || options.size() != 4) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "A question must have exactly 4 options");
        }

        long correctCount = options.stream()
                .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                .count();

        if (correctCount != 1) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Exactly 1 option must be marked as correct (found: " + correctCount + ")");
        }
    }

    private Question findQuestionEntity(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
    }

    private QuestionResponse mapToResponse(Question question) {
        List<OptionResponse> optionResponses = question.getOptions().stream()
                .sorted(Comparator.comparing(QuestionOption::getPosition))
                .map(opt -> OptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .isCorrect(opt.getIsCorrect())
                        .position(opt.getPosition())
                        .build())
                .toList();

        return QuestionResponse.builder()
                .id(question.getId())
                .subjectId(question.getSubject().getId())
                .subjectName(question.getSubject().getName())
                .categoryId(question.getSubject().getCategory().getId())
                .categoryName(question.getSubject().getCategory().getName())
                .text(question.getText())
                .explanation(question.getExplanation())
                .difficulty(question.getDifficulty())
                .active(question.getActive())
                .options(optionResponses)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}

