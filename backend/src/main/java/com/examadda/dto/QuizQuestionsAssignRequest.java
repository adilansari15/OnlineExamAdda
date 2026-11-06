package com.examadda.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionsAssignRequest {

    @NotNull(message = "Questions list cannot be null")
    @Valid
    @Builder.Default
    private List<QuizQuestionItemRequest> questions = new ArrayList<>();
}

