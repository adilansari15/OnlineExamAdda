package com.examadda.controller;

import com.examadda.dto.*;
import com.examadda.entity.Difficulty;
import com.examadda.entity.QuizStatus;
import com.examadda.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/quizzes")
@RequiredArgsConstructor
public class QuizAdminController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuizResponse>>> getQuizzes(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) QuizStatus status,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        PageResponse<QuizResponse> response = quizService.getAdminQuizzes(q, categoryId, status, difficulty, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(@PathVariable Long id) {
        QuizResponse quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(ApiResponse.ok(quiz));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody QuizRequest request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        QuizResponse created = quizService.createQuiz(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Quiz created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest request) {
        QuizResponse updated = quizService.updateQuiz(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Quiz updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.ok("Quiz deleted successfully"));
    }

    @PutMapping("/{id}/questions")
    public ResponseEntity<ApiResponse<QuizResponse>> assignQuestions(
            @PathVariable Long id,
            @Valid @RequestBody QuizQuestionsAssignRequest request) {
        QuizResponse updated = quizService.assignQuestions(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Questions assigned successfully", updated));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<QuizResponse>> publishQuiz(@PathVariable Long id) {
        QuizResponse published = quizService.publishQuiz(id);
        return ResponseEntity.ok(ApiResponse.ok("Quiz published successfully", published));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<QuizResponse>> unpublishQuiz(@PathVariable Long id) {
        QuizResponse unpublished = quizService.unpublishQuiz(id);
        return ResponseEntity.ok(ApiResponse.ok("Quiz unpublished successfully", unpublished));
    }
}

