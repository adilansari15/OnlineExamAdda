package com.examadda.controller;

import com.examadda.ExamAddaApplication;
import com.examadda.dto.LoginRequest;
import com.examadda.dto.PasswordChangeRequest;
import com.examadda.dto.RegisterRequest;
import com.examadda.dto.StudentStatusRequest;
import com.examadda.entity.User;
import com.examadda.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminDashboardStudentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String studentToken;
    private Long studentId;
    private final String studentEmail = "disablestudent@test.local";
    private final String studentPassword = "StudentPass123";

    @BeforeAll
    static void setupEnv() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @BeforeEach
    void setUpData() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@examadda.local", "Zehra@2305");
        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        RegisterRequest studentRegister = new RegisterRequest(
                "Managed Student",
                studentEmail,
                studentPassword
        );
        MvcResult studentResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentRegister)))
                .andExpect(status().isCreated())
                .andReturn();

        studentToken = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .get("data").get("token").asText();
        studentId = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .get("data").get("user").get("id").asLong();
    }

    @Test
    @DisplayName("1. Admin Dashboard returns metrics matching DB and recent activities")
    void testAdminDashboardMetrics() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalStudents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalQuizzes", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.totalQuestions", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.recentActivity", notNullValue()));
    }

    @Test
    @DisplayName("2. List students with query filter and inspect student details")
    void testStudentsListingAndDetail() throws Exception {
        mockMvc.perform(get("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("q", "Managed Student")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].email").value(studentEmail));

        mockMvc.perform(get("/api/admin/students/" + studentId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(studentId))
                .andExpect(jsonPath("$.data.fullName").value("Managed Student"));
    }

    @Test
    @DisplayName("3. Disable student -> Login blocked with 403 Forbidden. Re-enable -> Login succeeds.")
    void testDisableStudentBlocksLogin() throws Exception {
        // Disable student
        StudentStatusRequest disableReq = new StudentStatusRequest(false);
        mockMvc.perform(patch("/api/admin/students/" + studentId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(false));

        // Attempt login with disabled account -> 403 FORBIDDEN
        LoginRequest loginReq = new LoginRequest(studentEmail, studentPassword);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message", containsString("Account is disabled")));

        // Re-enable student
        StudentStatusRequest enableReq = new StudentStatusRequest(true);
        mockMvc.perform(patch("/api/admin/students/" + studentId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(true));

        // Attempt login -> 200 OK
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", notNullValue()));
    }

    @Test
    @DisplayName("4. Admin change password validates current password and updates hash")
    void testAdminChangePassword() throws Exception {
        // Invalid current password -> 400
        PasswordChangeRequest invalidReq = new PasswordChangeRequest("WrongCurrentPass", "NewStrongPass123");
        mockMvc.perform(put("/api/admin/settings/password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // Valid change password -> 200
        PasswordChangeRequest validReq = new PasswordChangeRequest("Zehra@2305", "NewAdminSecretPass999");
        mockMvc.perform(put("/api/admin/settings/password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

        // Verify login with new password works
        LoginRequest newLogin = new LoginRequest("admin@examadda.local", "NewAdminSecretPass999");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLogin)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("5. Student role blocked on admin endpoints (403 Forbidden)")
    void testStudentForbiddenOnAdminOperations() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/admin/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(put("/api/admin/settings/password")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordChangeRequest("any", "newpassword123"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}

