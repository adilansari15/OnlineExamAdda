package com.examadda.controller;

import com.examadda.ExamAddaApplication;
import com.examadda.dto.*;
import com.examadda.entity.*;
import com.examadda.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class StudentQuizIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private String studentToken;
    private Long studentId;
    private final String studentEmail = "portalstudent@test.local";
    private final String studentPassword = "StudentPortalPass123";

    private Long publishedQuizId;
    private Long draftQuizId;
    private Long testCategoryId;

    @BeforeAll
    static void setupEnv() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @BeforeEach
    void setUp() throws Exception {
        userRepository.findByEmail(studentEmail).ifPresent(u -> {
            u.setFullName("Portal Student");
            u.setPasswordHash(passwordEncoder.encode(studentPassword));
            userRepository.save(u);
        });

        // Register or login test student
        if (!userRepository.existsByEmail(studentEmail)) {
            RegisterRequest reg = new RegisterRequest("Portal Student", studentEmail, studentPassword);
            MvcResult res = mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reg)))
                    .andExpect(status().isCreated())
                    .andReturn();
            studentToken = objectMapper.readTree(res.getResponse().getContentAsString())
                    .get("data").get("token").asText();
            studentId = objectMapper.readTree(res.getResponse().getContentAsString())
                    .get("data").get("user").get("id").asLong();
        } else {
            LoginRequest login = new LoginRequest(studentEmail, studentPassword);
            MvcResult res = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(login)))
                    .andExpect(status().isOk())
                    .andReturn();
            studentToken = objectMapper.readTree(res.getResponse().getContentAsString())
                    .get("data").get("token").asText();
            studentId = userRepository.findByEmail(studentEmail).orElseThrow().getId();
        }

        // Ensure category
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() ->
                categoryRepository.save(Category.builder().name("General Science").slug("general-science").active(true).build())
        );
        testCategoryId = category.getId();

        // Create 1 Published quiz and 1 Draft quiz
        Quiz publishedQuiz = quizRepository.save(Quiz.builder()
                .title("Student Portal Java Exam")
                .description("Assessment of core Java skills")
                .instructions("1. Answer all questions.\n2. Negative marking applies.")
                .category(category)
                .difficulty(Difficulty.MEDIUM)
                .durationMinutes(45)
                .totalMarks(new BigDecimal("100.00"))
                .marksPerQuestion(new BigDecimal("4.00"))
                .negativeMarks(new BigDecimal("1.00"))
                .maxAttempts(2)
                .status(QuizStatus.PUBLISHED)
                .build());
        publishedQuizId = publishedQuiz.getId();

        Quiz draftQuiz = quizRepository.save(Quiz.builder()
                .title("Unpublished Secret Quiz")
                .description("Should not be visible to students")
                .instructions("Draft instructions")
                .category(category)
                .difficulty(Difficulty.HARD)
                .durationMinutes(30)
                .totalMarks(new BigDecimal("50.00"))
                .marksPerQuestion(new BigDecimal("2.00"))
                .negativeMarks(BigDecimal.ZERO)
                .status(QuizStatus.DRAFT)
                .build());
        draftQuizId = draftQuiz.getId();
    }

    @Test
    @DisplayName("1. Published quizzes are discoverable, Draft quizzes are strictly hidden")
    void testBrowsePublishedQuizzesOnly() throws Exception {
        mockMvc.perform(get("/api/quizzes")
                        .header("Authorization", "Bearer " + studentToken)
                        .param("q", "Student Portal Java Exam"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].title").value("Student Portal Java Exam"))
                .andExpect(jsonPath("$.data.content[0].hasNegativeMarking").value(true));

        // Ensure draft quiz is NOT in the listing
        mockMvc.perform(get("/api/quizzes")
                        .header("Authorization", "Bearer " + studentToken)
                        .param("q", "Unpublished Secret Quiz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));

        // Direct request for draft quiz returns 404 NOT_FOUND
        mockMvc.perform(get("/api/quizzes/" + draftQuizId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("2. Filter published quizzes by category and difficulty")
    void testFilterAndSearchQuizzes() throws Exception {
        mockMvc.perform(get("/api/quizzes")
                        .header("Authorization", "Bearer " + studentToken)
                        .param("categoryId", testCategoryId.toString())
                        .param("difficulty", "MEDIUM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("3. Quiz Details payload NEVER includes questions or options (Security integrity)")
    void testQuizDetailsPayloadSecurity() throws Exception {
        mockMvc.perform(get("/api/quizzes/" + publishedQuizId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(publishedQuizId))
                .andExpect(jsonPath("$.data.title").value("Student Portal Java Exam"))
                .andExpect(jsonPath("$.data.instructions", containsString("Negative marking applies")))
                .andExpect(jsonPath("$.data.canAttempt").value(true))
                .andExpect(jsonPath("$.data.attemptsUsed").value(0))
                // Integrity check: NEVER return questions, options, or answer keys to student
                .andExpect(jsonPath("$.data.questions").doesNotExist())
                .andExpect(jsonPath("$.data.quizQuestions").doesNotExist())
                .andExpect(jsonPath("$.data.options").doesNotExist());
    }

    @Test
    @DisplayName("4. Student overview dashboard is zero-safe for new students")
    void testStudentDashboardZeroSafe() throws Exception {
        mockMvc.perform(get("/api/me/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.quizzesAttempted", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.stats.averageScore").value(0))
                .andExpect(jsonPath("$.data.recommendedQuizzes", notNullValue()))
                .andExpect(jsonPath("$.data.recentActivity", notNullValue()));
    }

    @Test
    @DisplayName("5. Student profile retrieval, update, and password change")
    void testStudentProfileAndChangePassword() throws Exception {
        // 1. Get profile
        mockMvc.perform(get("/api/me/profile")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(studentEmail))
                .andExpect(jsonPath("$.data.fullName").value("Portal Student"));

        // 2. Update profile
        UserProfileRequest updateReq = new UserProfileRequest("Updated Portal Student", "9123456789", "https://avatar.test/img.png");
        mockMvc.perform(put("/api/me/profile")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Updated Portal Student"))
                .andExpect(jsonPath("$.data.phone").value("9123456789"));

        // 3. Change password with wrong current password -> 400
        PasswordChangeRequest wrongPassReq = new PasswordChangeRequest("WrongCurrentPass", "BrandNewPass456");
        mockMvc.perform(put("/api/me/password")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPassReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // 4. Change password with valid current password -> 200
        PasswordChangeRequest validPassReq = new PasswordChangeRequest(studentPassword, "BrandNewPass456");
        mockMvc.perform(put("/api/me/password")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validPassReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully"));

        // 5. Verify login with new password succeeds
        LoginRequest newLogin = new LoginRequest(studentEmail, "BrandNewPass456");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", notNullValue()));
    }
}

