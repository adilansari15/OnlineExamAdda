package com.examadda.dto;

import com.examadda.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private Long categoryId;
    private String categoryName;
    private String text;
    private String explanation;
    private Difficulty difficulty;
    private Boolean active;
    private List<OptionResponse> options;
    private Instant createdAt;
    private Instant updatedAt;
}

