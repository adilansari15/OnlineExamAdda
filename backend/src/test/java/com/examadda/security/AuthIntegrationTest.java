package com.examadda.security;

import com.examadda.ExamAddaApplication;
import com.examadda.dto.LoginRequest;
import com.examadda.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    static void setup() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @Test
    @DisplayName("1. Register: Successfully creates student account and returns JWT with ROLE_STUDENT")
    void testRegisterStudentSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Jane Doe",
                "jane.doe@test.local",
                "StrongPass123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("jane.doe@test.local"))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_STUDENT"))
                .andExpect(jsonPath("$.data.user.enabled").value(true));
    }

    @Test
    @DisplayName("2. Register: Duplicate email registration returns 409 Conflict")
    void testRegisterDuplicateEmailConflict() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Duplicate User",
                "duplicate@test.local",
                "StrongPass123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    @DisplayName("3. Register: Weak password rejects with 400 Bad Request and VALIDATION_FAILED")
    void testRegisterWeakPasswordValidation() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Weak Pass User",
                "weak@test.local",
                "weak"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("4. Login: Valid credentials return 200 OK with token and user profile")
    void testLoginSuccess() throws Exception {
        RegisterRequest reg = new RegisterRequest(
                "Login Test User",
                "login.test@test.local",
                "ValidPass123"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("login.test@test.local", "ValidPass123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.role").value("ROLE_STUDENT"));
    }

    @Test
    @DisplayName("5. Login: Wrong password returns 401 UNAUTHENTICATED with generic error")
    void testLoginInvalidPasswordUnauthorized() throws Exception {
        LoginRequest login = new LoginRequest("nonexistent@test.local", "WrongPass123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    @DisplayName("6. Login: Seeded administrator can log in and receives ROLE_ADMIN")
    void testLoginSeededAdminSuccess() throws Exception {
        LoginRequest login = new LoginRequest("admin@examadda.local", "Zehra@2305");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("7. Auth Me: GET /api/auth/me returns current user with valid Bearer token")
    void testGetCurrentUserWithValidToken() throws Exception {
        RegisterRequest reg = new RegisterRequest(
                "Auth Me User",
                "auth.me@test.local",
                "ValidPass123"
        );
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andReturn();

        String token = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("auth.me@test.local"))
                .andExpect(jsonPath("$.data.fullName").value("Auth Me User"));
    }

    @Test
    @DisplayName("8. Tampered token: GET /api/auth/me returns 401 Unauthorized")
    void testAccessWithTamperedTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer invalid.tampered.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    @DisplayName("9. RBAC: Student token accessing /api/admin/** returns 403 Forbidden")
    void testStudentAccessToAdminReturns403() throws Exception {
        RegisterRequest reg = new RegisterRequest(
                "Student Forbidden",
                "student.forbidden@test.local",
                "ValidPass123"
        );
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        String studentToken = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        mockMvc.perform(get("/api/admin/check")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("10. RBAC: Admin token accessing /api/admin/** returns 200 OK")
    void testAdminAccessToAdminReturns200() throws Exception {
        LoginRequest login = new LoginRequest("admin@examadda.local", "Zehra@2305");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andReturn();

        String adminToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        mockMvc.perform(get("/api/admin/check")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AUTHORIZED"));
    }
}

