package com.examadda.controller;

import com.examadda.dto.*;
import com.examadda.entity.User;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.UserRepository;
import com.examadda.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;
    private final UserRepository userRepository;

    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<ApiResponse<ResultDetailResponse>> getResult(
            @PathVariable Long attemptId,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        ResultDetailResponse response = resultService.getResultDetail(attemptId, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Exam result retrieved successfully", response));
    }

    @GetMapping("/me/attempts")
    public ResponseEntity<ApiResponse<PageResponse<AttemptHistoryItemResponse>>> getMyAttempts(
            @PageableDefault(page = 0, size = 10) Pageable pageable,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        PageResponse<AttemptHistoryItemResponse> response = resultService.getMyAttempts(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok("Attempt history retrieved successfully", response));
    }

    @GetMapping("/me/performance")
    public ResponseEntity<ApiResponse<StudentPerformanceResponse>> getMyPerformance(
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        StudentPerformanceResponse response = resultService.getStudentPerformance(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Performance analytics retrieved successfully", response));
    }

    @GetMapping("/admin/results")
    public ResponseEntity<ApiResponse<PageResponse<AdminResultSummaryResponse>>> getAdminResults(
            @RequestParam(required = false) Long quizId,
            @PageableDefault(page = 0, size = 15) Pageable pageable
    ) {
        PageResponse<AdminResultSummaryResponse> response = resultService.getAdminResults(quizId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Results retrieved successfully", response));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));
    }
}

