package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.PageResponse;
import com.examadda.dto.QuestionRequest;
import com.examadda.dto.QuestionResponse;
import com.examadda.entity.Difficulty;
import com.examadda.service.QuestionService;
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
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
public class QuestionAdminController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuestionResponse>>> getQuestions(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        PageResponse<QuestionResponse> questions = questionService.getQuestions(q, subjectId, difficulty, pageable);
        return ResponseEntity.ok(ApiResponse.ok(questions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Long id) {
        QuestionResponse question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.ok(question));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        QuestionResponse created = questionService.createQuestion(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Question created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse updated = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Question updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.ok("Question deleted successfully"));
    }
}

