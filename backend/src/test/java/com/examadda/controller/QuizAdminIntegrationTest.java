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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class QuizAdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String studentToken;
    private Long testCategoryId;
    private Long testQuestion1Id;
    private Long testQuestion2Id;

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
                "Student Quiz",
                "quiz.student@test.local",
                "StudentPass123"
        );
        MvcResult studentResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentRegister)))
                .andReturn();
        studentToken = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        Category category = categoryRepository.findAll().get(0);
        testCategoryId = category.getId();
        Subject subject = subjectRepository.findByCategoryId(testCategoryId).get(0);
        User adminUser = userRepository.findByEmail("admin@examadda.local").orElseThrow();

        // Create 2 questions for quiz testing
        Question q1 = Question.builder()
                .subject(subject)
                .text("Test Question One?")
                .difficulty(Difficulty.EASY)
                .createdBy(adminUser)
                .build();
        q1.getOptions().add(new QuestionOption(q1, "Opt 1", true, (byte) 1));
        q1.getOptions().add(new QuestionOption(q1, "Opt 2", false, (byte) 2));
        q1.getOptions().add(new QuestionOption(q1, "Opt 3", false, (byte) 3));
        q1.getOptions().add(new QuestionOption(q1, "Opt 4", false, (byte) 4));
        testQuestion1Id = questionRepository.save(q1).getId();

        Question q2 = Question.builder()
                .subject(subject)
                .text("Test Question Two?")
                .difficulty(Difficulty.HARD)
                .createdBy(adminUser)
                .build();
        q2.getOptions().add(new QuestionOption(q2, "Opt A", false, (byte) 1));
        q2.getOptions().add(new QuestionOption(q2, "Opt B", true, (byte) 2));
        q2.getOptions().add(new QuestionOption(q2, "Opt C", false, (byte) 3));
        q2.getOptions().add(new QuestionOption(q2, "Opt D", false, (byte) 4));
        testQuestion2Id = questionRepository.save(q2).getId();
    }

    private QuizRequest buildValidQuizRequest(String title) {
        return QuizRequest.builder()
                .categoryId(testCategoryId)
                .title(title)
                .description("Comprehensive test description")
                .instructions("Exam rules and instructions")
                .difficulty(Difficulty.MEDIUM)
                .durationMinutes(45)
                .marksPerQuestion(BigDecimal.valueOf(4.0))
                .negativeMarks(BigDecimal.valueOf(1.0))
                .passingMarks(BigDecimal.valueOf(20.0))
                .maxAttempts(3)
                .build();
    }

    @Test
    @DisplayName("1. Admin creates quiz with valid settings (201 Created, status DRAFT)")
    void testCreateQuizSuccess() throws Exception {
        QuizRequest req = buildValidQuizRequest("Java Certification Practice");

        mockMvc.perform(post("/api/admin/quizzes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Java Certification Practice"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.totalMarks").value(0.0));
    }

    @Test
    @DisplayName("2. Assign questions with overrides and verify total_marks recomputation")
    void testAssignQuestionsAndRecalculateTotalMarks() throws Exception {
        // Create quiz
        QuizRequest req = buildValidQuizRequest("Algorithm Mastery");
        MvcResult res = mockMvc.perform(post("/api/admin/quizzes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        long quizId = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Assign Q1 (default marks 4.0) + Q2 (override marks 6.0) -> total should be 10.0
        QuizQuestionsAssignRequest assignReq = QuizQuestionsAssignRequest.builder()
                .questions(List.of(
                        QuizQuestionItemRequest.builder().questionId(testQuestion1Id).build(),
                        QuizQuestionItemRequest.builder().questionId(testQuestion2Id).marksOverride(BigDecimal.valueOf(6.0)).build()
                ))
                .build();

        mockMvc.perform(put("/api/admin/quizzes/" + quizId + "/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.questionCount").value(2))
                .andExpect(jsonPath("$.data.totalMarks").value(10.0))
                .andExpect(jsonPath("$.data.questions[0].position").value(1))
                .andExpect(jsonPath("$.data.questions[1].position").value(2));
    }

    @Test
    @DisplayName("3. Publish validation: Cannot publish quiz with 0 questions (400 VALIDATION_FAILED)")
    void testPublishQuizWithoutQuestionsRejected() throws Exception {
        QuizRequest req = buildValidQuizRequest("Empty Quiz Publish Test");
        MvcResult res = mockMvc.perform(post("/api/admin/quizzes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        long quizId = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        mockMvc.perform(post("/api/admin/quizzes/" + quizId + "/publish")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message", containsString("at least 1 question")));
    }

    @Test
    @DisplayName("4. Publish & Unpublish quiz successfully")
    void testPublishAndUnpublishQuiz() throws Exception {
        QuizRequest req = buildValidQuizRequest("Publish Flow Test");
        MvcResult res = mockMvc.perform(post("/api/admin/quizzes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        long quizId = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Assign 1 question
        QuizQuestionsAssignRequest assignReq = QuizQuestionsAssignRequest.builder()
                .questions(List.of(QuizQuestionItemRequest.builder().questionId(testQuestion1Id).build()))
                .build();
        mockMvc.perform(put("/api/admin/quizzes/" + quizId + "/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        // Publish
        mockMvc.perform(post("/api/admin/quizzes/" + quizId + "/publish")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));

        // Unpublish
        mockMvc.perform(post("/api/admin/quizzes/" + quizId + "/unpublish")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DRAFT"));
    }

    @Test
    @DisplayName("5. Lock rule: Quiz with existing attempts blocks question modification and deletion (409 QUIZ_LOCKED)")
    void testLockedQuizWithAttempts() throws Exception {
        QuizRequest req = buildValidQuizRequest("Locked Quiz Flow");
        MvcResult res = mockMvc.perform(post("/api/admin/quizzes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        long quizId = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        User adminUser = userRepository.findByEmail("admin@examadda.local").orElseThrow();

        // Create attempt on this quiz
        examAttemptRepository.save(ExamAttempt.builder()
                .user(adminUser)
                .quiz(quiz)
                .attemptNo(1)
                .status(AttemptStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(1800))
                .marksPerQuestion(BigDecimal.valueOf(4.0))
                .negativeMarks(BigDecimal.valueOf(1.0))
                .build());

        // Try to assign new questions -> 409 QUIZ_LOCKED
        QuizQuestionsAssignRequest assignReq = QuizQuestionsAssignRequest.builder()
                .questions(List.of(QuizQuestionItemRequest.builder().questionId(testQuestion1Id).build()))
                .build();
        mockMvc.perform(put("/api/admin/quizzes/" + quizId + "/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("QUIZ_LOCKED"));

        // Try to delete quiz -> 409 QUIZ_LOCKED
        mockMvc.perform(delete("/api/admin/quizzes/" + quizId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("QUIZ_LOCKED"));
    }

    @Test
    @DisplayName("6. Student forbidden on /api/admin/quizzes (403)")
    void testStudentForbiddenOnQuizzes() throws Exception {
        mockMvc.perform(get("/api/admin/quizzes")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}

