package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.PageResponse;
import com.examadda.dto.StudentQuizCardResponse;
import com.examadda.dto.StudentQuizDetailResponse;
import com.examadda.entity.Difficulty;
import com.examadda.entity.User;
import com.examadda.repository.UserRepository;
import com.examadda.service.StudentQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class StudentQuizController {

    private final StudentQuizService studentQuizService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StudentQuizCardResponse>>> getQuizzes(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @PageableDefault(page = 0, size = 12) Pageable pageable
    ) {
        PageResponse<StudentQuizCardResponse> response = studentQuizService.getPublishedQuizzes(
                q, categoryId, difficulty, sort, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok("Quizzes retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentQuizDetailResponse>> getQuizById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            userId = userRepository.findByEmail(authentication.getName())
                    .map(User::getId)
                    .orElse(null);
        }

        StudentQuizDetailResponse response = studentQuizService.getPublishedQuizById(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Quiz details retrieved successfully", response));
    }
}

