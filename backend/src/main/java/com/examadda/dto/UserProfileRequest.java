package com.examadda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserProfileRequest(
        @NotBlank(message = "Full name cannot be blank")
        @Size(max = 100, message = "Full name must not exceed 100 characters")
        String fullName,

        @Size(max = 20, message = "Phone must not exceed 20 characters")
        String phone,

        @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
        String avatarUrl
) {
}

