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
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String icon;
    private Boolean active;
    private long subjectCount;
    private Instant createdAt;
    private Instant updatedAt;
}

