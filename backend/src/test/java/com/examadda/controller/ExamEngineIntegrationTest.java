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
class ExamEngineIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionOptionRepository questionOptionRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    private String studentToken;
    private Long studentId;
    private final String studentEmail = "examengine_student@test.local";
    private final String studentPassword = "EngineTestPass123";

    private Long quizId;
    private Long question1Id;
    private Long q1CorrectOptId;
    private Long q1WrongOptId;

    private Long question2Id;
    private Long q2CorrectOptId;

    @BeforeAll
    static void setupEnv() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @BeforeEach
    void setUp() throws Exception {
        // 1. Student setup
        if (!userRepository.existsByEmail(studentEmail)) {
            RegisterRequest reg = new RegisterRequest("Engine Student", studentEmail, studentPassword);
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reg)))
                    .andExpect(status().isCreated());
        }

        LoginRequest login = new LoginRequest(studentEmail, studentPassword);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        studentToken = objectMapper.readTree(res.getResponse().getContentAsString())
                .get("data").get("token").asText();
        studentId = userRepository.findByEmail(studentEmail).orElseThrow().getId();

        // 2. Data setup: Category & Subject
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() ->
                categoryRepository.save(Category.builder().name("Exam Engine Science").slug("exam-engine-science").active(true).build())
        );

        Subject subject = subjectRepository.findAll().stream().findFirst().orElseGet(() ->
                subjectRepository.save(Subject.builder().category(category).name("Engine Mechanics").slug("engine-mechanics").build())
        );

        // 3. Question 1 (4 options, 1 correct)
        Question q1 = Question.builder()
                .subject(subject)
                .text("What is the speed of light?")
                .explanation("Light travels at approximately 300,000 km/s in vacuum.")
                .difficulty(Difficulty.EASY)
                .build();
        Question savedQ1 = questionRepository.save(q1);
        question1Id = savedQ1.getId();

        QuestionOption opt1A = questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ1).optionText("300,000 km/s").isCorrect(true).position((byte) 1).build());
        QuestionOption opt1B = questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ1).optionText("150,000 km/s").isCorrect(false).position((byte) 2).build());
        questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ1).optionText("450,000 km/s").isCorrect(false).position((byte) 3).build());
        questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ1).optionText("100,000 km/s").isCorrect(false).position((byte) 4).build());

        q1CorrectOptId = opt1A.getId();
        q1WrongOptId = opt1B.getId();

        // 4. Question 2 (4 options, 1 correct)
        Question q2 = Question.builder()
                .subject(subject)
                .text("Which planet is closest to the Sun?")
                .explanation("Mercury is the innermost and smallest planet.")
                .difficulty(Difficulty.EASY)
                .build();
        Question savedQ2 = questionRepository.save(q2);
        question2Id = savedQ2.getId();

        QuestionOption opt2A = questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ2).optionText("Mercury").isCorrect(true).position((byte) 1).build());
        questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ2).optionText("Venus").isCorrect(false).position((byte) 2).build());
        questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ2).optionText("Earth").isCorrect(false).position((byte) 3).build());
        questionOptionRepository.save(QuestionOption.builder()
                .question(savedQ2).optionText("Mars").isCorrect(false).position((byte) 4).build());

        q2CorrectOptId = opt2A.getId();

        // 5. Quiz setup
        Quiz quiz = quizRepository.save(Quiz.builder()
                .title("Physics & Astronomy Engine Quiz")
                .description("Core test of basic physics")
                .instructions("Negative marking: 1 mark deducted per wrong answer.")
                .category(category)
                .difficulty(Difficulty.EASY)
                .durationMinutes(30)
                .marksPerQuestion(new BigDecimal("4.00"))
                .negativeMarks(new BigDecimal("1.00"))
                .totalMarks(new BigDecimal("8.00"))
                .maxAttempts(5)
                .status(QuizStatus.PUBLISHED)
                .build());
        quizId = quiz.getId();

        // Link questions to quiz
        quizQuestionRepository.save(QuizQuestion.builder()
                .id(new QuizQuestionId(quizId, question1Id))
                .quiz(quiz)
                .question(savedQ1)
                .position(1)
                .build());

        quizQuestionRepository.save(QuizQuestion.builder()
                .id(new QuizQuestionId(quizId, question2Id))
                .quiz(quiz)
                .question(savedQ2)
                .position(2)
                .build());
    }

    @Test
    @DisplayName("End-to-end: Start -> Autosave answers -> Submit -> Review & Analytics")
    void testFullExamEngineLoop() throws Exception {
        // 1. Start Attempt
        MvcResult startResult = mockMvc.perform(post("/api/quizzes/" + quizId + "/attempts")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.attemptId", notNullValue()))
                .andExpect(jsonPath("$.data.totalQuestions").value(2))
                .andExpect(jsonPath("$.data.remainingSeconds", greaterThan(0)))
                .andExpect(jsonPath("$.data.questions[0].options", hasSize(4)))
                // Verify answers are strictly concealed before submission
                .andExpect(jsonPath("$.data.questions[0].options[0].isCorrect").doesNotExist())
                .andExpect(jsonPath("$.data.questions[0].explanation").doesNotExist())
                .andReturn();

        Long attemptId = objectMapper.readTree(startResult.getResponse().getContentAsString())
                .get("data").get("attemptId").asLong();

        // 2. Starting again resumes existing in-progress attempt
        mockMvc.perform(post("/api/quizzes/" + quizId + "/attempts")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.attemptId").value(attemptId));

        // 3. Autosave Question 1 with correct option
        AutosaveAnswerRequest q1Req = new AutosaveAnswerRequest(q1CorrectOptId, false, true);
        mockMvc.perform(put("/api/attempts/" + attemptId + "/answers/" + question1Id)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q1Req)))
                .andExpect(status().isOk());

        // 4. Autosave Question 2 with wrong option and review flag
        AutosaveAnswerRequest q2Req = new AutosaveAnswerRequest(q1WrongOptId, true, true); // wait, q1WrongOptId does not belong to Q2!
        // Expect validation failure since option belongs to Q1, not Q2!
        mockMvc.perform(put("/api/attempts/" + attemptId + "/answers/" + question2Id)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q2Req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // Autosave with valid unattempted option (null clears selection)
        AutosaveAnswerRequest q2Clear = new AutosaveAnswerRequest(null, true, true);
        mockMvc.perform(put("/api/attempts/" + attemptId + "/answers/" + question2Id)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q2Clear)))
                .andExpect(status().isOk());

        // 5. Submit Examination: Q1 correct (+4), Q2 unattempted (0) -> Score: 4.00, Accuracy: 100%
        mockMvc.perform(post("/api/attempts/" + attemptId + "/submit")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.correctCount").value(1))
                .andExpect(jsonPath("$.data.unattemptedCount").value(1))
                .andExpect(jsonPath("$.data.obtainedMarks").value(4.0))
                .andExpect(jsonPath("$.data.totalMarks").value(8.0))
                .andExpect(jsonPath("$.data.percentage").value(50.0))
                .andExpect(jsonPath("$.data.accuracy").value(100.0));

        // 6. Idempotent Submit: re-submitting returns same result
        mockMvc.perform(post("/api/attempts/" + attemptId + "/submit")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.obtainedMarks").value(4.0));

        // 7. Get Result Detail with question-by-question review & explanations
        mockMvc.perform(get("/api/attempts/" + attemptId + "/result")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.attemptId").value(attemptId))
                .andExpect(jsonPath("$.data.obtainedMarks").value(4.0))
                .andExpect(jsonPath("$.data.questions", hasSize(2)))
                .andExpect(jsonPath("$.data.questions[0].isCorrect").value(true))
                .andExpect(jsonPath("$.data.questions[0].explanation", containsString("300,000 km/s")))
                .andExpect(jsonPath("$.data.questions[0].options[0].isCorrect", notNullValue()));

        // 8. Attempt History
        mockMvc.perform(get("/api/me/attempts")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].attemptId").value(attemptId))
                .andExpect(jsonPath("$.data.content[0].obtainedMarks").value(4.0));

        // 9. Student Performance Analytics
        mockMvc.perform(get("/api/me/performance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAttempts", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.categoryMastery", hasSize(greaterThanOrEqualTo(1))));
    }
}
