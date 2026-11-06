package com.examadda.exception;

public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(ErrorCode.FORBIDDEN, message);
    }
}

