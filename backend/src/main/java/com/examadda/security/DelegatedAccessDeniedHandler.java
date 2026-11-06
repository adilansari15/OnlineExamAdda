package com.examadda.security;

import com.examadda.dto.ErrorResponse;
import com.examadda.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class DelegatedAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public DelegatedAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.of(
                HttpStatus.FORBIDDEN.value(),
                ErrorCode.FORBIDDEN.getCode(),
                "Access denied: insufficient permissions to access this resource",
                request.getRequestURI()
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}

