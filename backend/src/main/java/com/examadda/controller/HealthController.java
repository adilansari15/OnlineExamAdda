package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final Clock clock;

    public HealthController(Clock clock) {
        this.clock = clock;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("status", "UP");
        data.put("service", "online-exam-adda-backend");
        data.put("serverTime", Instant.now(clock).toString());
        data.put("version", "1.0.0");

        return ResponseEntity.ok(ApiResponse.ok("Service is healthy", data));
    }
}

