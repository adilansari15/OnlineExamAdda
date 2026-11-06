package com.examadda.controller;

import com.examadda.dto.AdminDashboardResponse;
import com.examadda.dto.ApiResponse;
import com.examadda.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = adminUserService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }
}

