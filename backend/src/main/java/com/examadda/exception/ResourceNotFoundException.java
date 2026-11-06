package com.examadda.exception;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(ErrorCode.NOT_FOUND, resource + " not found with " + field + ": " + value);
    }
}

