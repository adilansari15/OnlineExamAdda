package com.examadda.dto;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        boolean success,
        int status,
        String code,
        String message,
        List<FieldErrorDetail> errors,
        String path,
        Instant timestamp
) {
    public record FieldErrorDetail(String field, String message) {}

    public static ErrorResponse of(int status, String code, String message, String path) {
        return new ErrorResponse(false, status, code, message, List.of(), path, Instant.now());
    }

    public static ErrorResponse of(int status, String code, String message, List<FieldErrorDetail> errors, String path) {
        return new ErrorResponse(false, status, code, message, errors != null ? errors : List.of(), path, Instant.now());
    }
}

