package com.examadda.dto;

public record UserSummary(
        Long id,
        String fullName,
        String email,
        String role,
        String phone,
        String avatarUrl,
        boolean enabled
) {}

