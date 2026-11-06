package com.examadda.dto;

import com.examadda.entity.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Question text is required")
    private String text;

    private String explanation;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @Builder.Default
    private Boolean active = true;

    @NotNull(message = "Options are required")
    @Size(min = 4, max = 4, message = "A question must have exactly 4 options")
    @Valid
    private List<OptionRequest> options;
}

