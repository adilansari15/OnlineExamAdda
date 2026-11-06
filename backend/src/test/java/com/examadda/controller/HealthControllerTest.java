package com.examadda.controller;

import com.examadda.ExamAddaApplication;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeAll
    static void setup() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @Test
    @DisplayName("GET /api/health returns standard success envelope and UP status")
    void healthCheckReturnsSuccessEnvelope() throws Exception {
        mockMvc.perform(get("/api/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Service is healthy"))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.service").value("online-exam-adda-backend"))
                .andExpect(jsonPath("$.data.version").value("1.0.0"))
                .andExpect(jsonPath("$.data.serverTime").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }
}
