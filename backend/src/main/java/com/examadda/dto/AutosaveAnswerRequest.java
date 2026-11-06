package com.examadda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutosaveAnswerRequest {
    private Long selectedOptionId;
    private Boolean markedForReview;
    private Boolean visited;
}

