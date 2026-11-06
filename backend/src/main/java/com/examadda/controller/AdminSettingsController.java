package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.PasswordChangeRequest;
import com.examadda.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminUserService adminUserService;

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        adminUserService.changeAdminPassword(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }
}

