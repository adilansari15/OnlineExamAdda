package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Boolean enabled;
    private long totalAttempts;
    private Instant createdAt;
}

