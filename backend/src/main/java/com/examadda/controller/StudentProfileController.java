package com.examadda.controller;

import com.examadda.dto.*;
import com.examadda.entity.User;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.UserRepository;
import com.examadda.service.StudentDashboardService;
import com.examadda.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentDashboardService studentDashboardService;
    private final StudentProfileService studentProfileService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getDashboard(Authentication authentication) {
        User user = getCurrentUser(authentication);
        StudentDashboardResponse response = studentDashboardService.getStudentDashboard(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Student dashboard retrieved", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        User user = getCurrentUser(authentication);
        UserProfileResponse response = studentProfileService.getProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileRequest request
    ) {
        User user = getCurrentUser(authentication);
        UserProfileResponse response = studentProfileService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        User user = getCurrentUser(authentication);
        studentProfileService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully", null));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));
    }
}

