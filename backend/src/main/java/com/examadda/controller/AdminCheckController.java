package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminCheckController {

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkAdminAccess() {
        return ResponseEntity.ok(ApiResponse.ok("Admin access authorized", Map.of("status", "AUTHORIZED")));
    }
}

