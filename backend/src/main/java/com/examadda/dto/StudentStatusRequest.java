package com.examadda.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatusRequest {

    @NotNull(message = "Enabled flag is required")
    private Boolean enabled;
}

