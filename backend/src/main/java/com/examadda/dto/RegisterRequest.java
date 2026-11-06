package com.examadda.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must not exceed 100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 150, message = "Email must not exceed 150 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "Password must be at least 8 characters long and contain both letters and numbers"
        )
        String password
) {}

