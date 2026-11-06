package com.examadda.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND"),
    CONFLICT(HttpStatus.CONFLICT, "CONFLICT"),
    ATTEMPT_CLOSED(HttpStatus.CONFLICT, "ATTEMPT_CLOSED"),
    ATTEMPT_LIMIT_REACHED(HttpStatus.CONFLICT, "ATTEMPT_LIMIT_REACHED"),
    QUIZ_NOT_AVAILABLE(HttpStatus.CONFLICT, "QUIZ_NOT_AVAILABLE"),
    QUIZ_LOCKED(HttpStatus.CONFLICT, "QUIZ_LOCKED"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");

    private final HttpStatus httpStatus;
    private final String code;

    ErrorCode(HttpStatus httpStatus, String code) {
        this.httpStatus = httpStatus;
        this.code = code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getCode() {
        return code;
    }
}

