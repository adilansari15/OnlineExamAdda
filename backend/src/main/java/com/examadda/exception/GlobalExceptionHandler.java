package com.examadda.exception;

import com.examadda.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        ErrorResponse response = ErrorResponse.of(
                errorCode.getHttpStatus().value(),
                errorCode.getCode(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, errorCode.getHttpStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ErrorResponse.FieldErrorDetail> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new ErrorResponse.FieldErrorDetail(
                        err.getField(),
                        err.getDefaultMessage() != null ? err.getDefaultMessage() : "Invalid value"
                ))
                .toList();

        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                ErrorCode.VALIDATION_FAILED.getCode(),
                "Validation failed for one or more fields",
                fieldErrors,
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.FORBIDDEN.value(),
                ErrorCode.FORBIDDEN.getCode(),
                "Access denied: " + ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.UNAUTHORIZED.value(),
                ErrorCode.UNAUTHENTICATED.getCode(),
                "Invalid credentials",
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(NoResourceFoundException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.NOT_FOUND.value(),
                ErrorCode.NOT_FOUND.getCode(),
                "Resource not found: " + ex.getResourcePath(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at path: {}", request.getRequestURI(), ex);
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ErrorCode.INTERNAL_ERROR.getCode(),
                "An unexpected internal error occurred",
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

