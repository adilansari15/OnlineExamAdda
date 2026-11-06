package com.examadda.controller;

import com.examadda.ExamAddaApplication;
import com.examadda.dto.LoginRequest;
import com.examadda.dto.OptionRequest;
import com.examadda.dto.QuestionRequest;
import com.examadda.dto.RegisterRequest;
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
class QuestionAdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String studentToken;
    private Long testSubjectId;

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
                "Student Question",
                "q.student@test.local",
                "StudentPass123"
        );
        MvcResult studentResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentRegister)))
                .andReturn();
        studentToken = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        testSubjectId = subjectRepository.findAll().get(0).getId();
    }

    private QuestionRequest buildValidQuestion(String text) {
        return QuestionRequest.builder()
                .subjectId(testSubjectId)
                .text(text)
                .explanation("Detailed explanation for " + text)
                .difficulty(Difficulty.MEDIUM)
                .active(true)
                .options(List.of(
                        new OptionRequest(null, "Option A", false, (byte) 1),
                        new OptionRequest(null, "Option B (Correct)", true, (byte) 2),
                        new OptionRequest(null, "Option C", false, (byte) 3),
                        new OptionRequest(null, "Option D", false, (byte) 4)
                ))
                .build();
    }

    @Test
    @DisplayName("1. Admin creates question with exactly 4 options and 1 correct option (201)")
    void testCreateQuestionSuccess() throws Exception {
        QuestionRequest req = buildValidQuestion("What is the time complexity of binary search?");

        mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.text").value("What is the time complexity of binary search?"))
                .andExpect(jsonPath("$.data.difficulty").value("MEDIUM"))
                .andExpect(jsonPath("$.data.options", hasSize(4)));
    }

    @Test
    @DisplayName("2. Validation: Question with options count != 4 rejected (400)")
    void testQuestionOptionsCountInvalid() throws Exception {
        QuestionRequest req = buildValidQuestion("Invalid question");
        req.setOptions(List.of(
                new OptionRequest(null, "Option A", false, (byte) 1),
                new OptionRequest(null, "Option B", true, (byte) 2)
        ));

        mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("3. Validation: Question with correct options count != 1 rejected (400)")
    void testQuestionMultipleCorrectOptionsRejected() throws Exception {
        QuestionRequest req = buildValidQuestion("Two correct options question");
        req.setOptions(List.of(
                new OptionRequest(null, "Option A", true, (byte) 1),
                new OptionRequest(null, "Option B", true, (byte) 2),
                new OptionRequest(null, "Option C", false, (byte) 3),
                new OptionRequest(null, "Option D", false, (byte) 4)
        ));

        mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message", containsString("Exactly 1 option must be marked as correct")));
    }

    @Test
    @DisplayName("4. Paginated listing with text and difficulty filters")
    void testListQuestionsFiltered() throws Exception {
        QuestionRequest q1 = buildValidQuestion("Unique Searchable Query Term Alpha");
        QuestionRequest q2 = buildValidQuestion("Another Question Beta");

        mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q2)))
                .andExpect(status().isCreated());

        // Search for Alpha
        mockMvc.perform(get("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("q", "Searchable Query Term")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].text", containsString("Searchable Query Term")));
    }

    @Test
    @DisplayName("5. Lock rule: Changing answer key of question in a quiz with attempts throws 409 QUIZ_LOCKED")
    void testCannotChangeAnswerKeyWhenQuizHasAttempts() throws Exception {
        // Create question
        QuestionRequest req = buildValidQuestion("Question in quiz with attempt");
        MvcResult res = mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        long questionId = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Create Quiz
        Subject subject = subjectRepository.findById(testSubjectId).orElseThrow();
        User adminUser = userRepository.findByEmail("admin@examadda.local").orElseThrow();
        Quiz quiz = quizRepository.save(Quiz.builder()
                .category(subject.getCategory())
                .title("Locked Quiz Test")
                .difficulty(Difficulty.MEDIUM)
                .status(QuizStatus.PUBLISHED)
                .durationMinutes(30)
                .marksPerQuestion(BigDecimal.valueOf(4))
                .negativeMarks(BigDecimal.valueOf(1))
                .totalMarks(BigDecimal.valueOf(4))
                .createdBy(adminUser)
                .build());

        // Attach question to quiz
        quizQuestionRepository.save(QuizQuestion.builder()
                .id(new QuizQuestionId(quiz.getId(), questionId))
                .quiz(quiz)
                .question(questionRepository.findById(questionId).orElseThrow())
                .position(1)
                .build());

        // Create an attempt
        examAttemptRepository.save(ExamAttempt.builder()
                .user(adminUser)
                .quiz(quiz)
                .attemptNo(1)
                .status(AttemptStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(1800))
                .marksPerQuestion(BigDecimal.valueOf(4))
                .negativeMarks(BigDecimal.valueOf(1))
                .build());

        // Try to update question and change the answer key (swap correct option to Option A)
        QuestionRequest updateReq = buildValidQuestion("Question in quiz with attempt");
        updateReq.setOptions(List.of(
                new OptionRequest(null, "Option A (Now Correct)", true, (byte) 1),
                new OptionRequest(null, "Option B (Was Correct)", false, (byte) 2),
                new OptionRequest(null, "Option C", false, (byte) 3),
                new OptionRequest(null, "Option D", false, (byte) 4)
        ));

        mockMvc.perform(put("/api/admin/questions/" + questionId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("QUIZ_LOCKED"))
                .andExpect(jsonPath("$.message", containsString("Cannot change the answer key")));

        // Try to delete question -> also 409 QUIZ_LOCKED
        mockMvc.perform(delete("/api/admin/questions/" + questionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("QUIZ_LOCKED"))
                .andExpect(jsonPath("$.message", containsString("Cannot delete a question used in a quiz")));
    }

    @Test
    @DisplayName("6. Student forbidden on /api/admin/questions (403)")
    void testStudentForbiddenOnQuestions() throws Exception {
        mockMvc.perform(get("/api/admin/questions")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}

