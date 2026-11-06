package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String description;
    private Boolean active;
    private long questionCount;
    private Instant createdAt;
    private Instant updatedAt;
}

