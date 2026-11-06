package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamQuestionDto {
    private Long id;
    private Integer position;
    private String questionText;
    private List<ExamOptionDto> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamOptionDto {
        private Long id;
        private Integer position;
        private String optionText;
    }
}

