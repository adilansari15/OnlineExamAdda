package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.AutosaveAnswerRequest;
import com.examadda.dto.StartAttemptResponse;
import com.examadda.dto.SubmitAttemptResponse;
import com.examadda.entity.User;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.UserRepository;
import com.examadda.service.ExamAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExamAttemptController {

    private final ExamAttemptService examAttemptService;
    private final UserRepository userRepository;

    @PostMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<ApiResponse<StartAttemptResponse>> startAttempt(
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        StartAttemptResponse response = examAttemptService.startOrResumeAttempt(quizId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Exam attempt started successfully", response));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ApiResponse<StartAttemptResponse>> getAttemptState(
            @PathVariable Long attemptId,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        StartAttemptResponse response = examAttemptService.getAttemptState(attemptId, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Exam state retrieved successfully", response));
    }

    @PutMapping("/attempts/{attemptId}/answers/{questionId}")
    public ResponseEntity<ApiResponse<Void>> autosaveAnswer(
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            @RequestBody AutosaveAnswerRequest request,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        examAttemptService.autosaveAnswer(attemptId, questionId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Answer saved successfully", null));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<SubmitAttemptResponse>> submitAttempt(
            @PathVariable Long attemptId,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        SubmitAttemptResponse response = examAttemptService.submitAttempt(attemptId, user.getId(), false);
        return ResponseEntity.ok(ApiResponse.ok("Exam submitted successfully", response));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));
    }
}

