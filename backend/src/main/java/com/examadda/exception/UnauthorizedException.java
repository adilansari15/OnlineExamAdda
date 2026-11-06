package com.examadda.exception;

public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHENTICATED, message);
    }
}

