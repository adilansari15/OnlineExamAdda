package com.examadda.exception;

public class ValidationException extends ApiException {

    public ValidationException(String message) {
        super(ErrorCode.VALIDATION_FAILED, message);
    }
}

