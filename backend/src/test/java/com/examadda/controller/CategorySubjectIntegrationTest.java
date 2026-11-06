package com.examadda.controller;

import com.examadda.ExamAddaApplication;
import com.examadda.dto.CategoryRequest;
import com.examadda.dto.LoginRequest;
import com.examadda.dto.RegisterRequest;
import com.examadda.dto.SubjectRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CategorySubjectIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    private String adminToken;
    private String studentToken;

    @BeforeAll
    static void setupEnv() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @BeforeEach
    void setUpTokens() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@examadda.local", "Zehra@2305");
        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminResult.getResponse().getContentAsString())
                .get("data").get("token").asText();

        RegisterRequest studentRegister = new RegisterRequest(
                "Test Student",
                "cat.student@test.local",
                "StudentPass123"
        );
        MvcResult studentResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentRegister)))
                .andReturn();
        studentToken = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .get("data").get("token").asText();
    }

    @Test
    @DisplayName("1. Public: GET /api/categories returns active categories")
    void testPublicGetCategories() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", not(empty())));
    }

    @Test
    @DisplayName("2. Admin Category CRUD & auto-generated slug")
    void testAdminCategoryCrud() throws Exception {
        CategoryRequest createReq = CategoryRequest.builder()
                .name("Cloud Architecture")
                .description("Cloud computing and architectures")
                .icon("cloud")
                .active(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Cloud Architecture"))
                .andExpect(jsonPath("$.data.slug").value("cloud-architecture"))
                .andReturn();

        long categoryId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Read by ID
        mockMvc.perform(get("/api/admin/categories/" + categoryId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(categoryId));

        // Update
        CategoryRequest updateReq = CategoryRequest.builder()
                .name("Cloud Architecture & DevOps")
                .description("Updated description")
                .icon("server")
                .active(true)
                .build();

        mockMvc.perform(put("/api/admin/categories/" + categoryId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Cloud Architecture & DevOps"))
                .andExpect(jsonPath("$.data.slug").value("cloud-architecture-devops"));

        // Delete
        mockMvc.perform(delete("/api/admin/categories/" + categoryId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Category deleted successfully"));
    }

    @Test
    @DisplayName("3. Duplicate Category Name throws 409 Conflict")
    void testDuplicateCategoryNameReturns409() throws Exception {
        CategoryRequest req1 = CategoryRequest.builder()
                .name("DevOps Engineering")
                .build();

        mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    @DisplayName("4. Category deletion blocked with 409 when subjects exist")
    void testDeleteCategoryWithSubjectsBlocked() throws Exception {
        // Category 1 (seeded in V2) has subjects
        mockMvc.perform(delete("/api/admin/categories/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(jsonPath("$.message", containsString("has associated subjects")));
    }

    @Test
    @DisplayName("5. Subject CRUD & duplicate check in category")
    void testSubjectCrudAndDuplicateCheck() throws Exception {
        Category category = categoryRepository.findAll().get(0);

        SubjectRequest subjectReq = SubjectRequest.builder()
                .categoryId(category.getId())
                .name("Advanced Microservices")
                .description("Microservice patterns and testing")
                .active(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/admin/subjects")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(subjectReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Advanced Microservices"))
                .andExpect(jsonPath("$.data.slug").value("advanced-microservices"))
                .andReturn();

        long subjectId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Duplicate in same category -> 409
        mockMvc.perform(post("/api/admin/subjects")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(subjectReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        // Delete subject
        mockMvc.perform(delete("/api/admin/subjects/" + subjectId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6. Subject deletion blocked with 409 when questions exist")
    void testDeleteSubjectWithQuestionsBlocked() throws Exception {
        Category category = categoryRepository.findAll().get(0);
        Subject subject = subjectRepository.save(Subject.builder()
                .category(category)
                .name("Locked Subject")
                .slug("locked-subject")
                .build());

        User adminUser = userRepository.findByEmail("admin@examadda.local").orElseThrow();

        Question question = Question.builder()
                .subject(subject)
                .text("Sample Question?")
                .difficulty(Difficulty.EASY)
                .createdBy(adminUser)
                .build();
        questionRepository.save(question);

        mockMvc.perform(delete("/api/admin/subjects/" + subject.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(jsonPath("$.message", containsString("has associated questions")));
    }

    @Test
    @DisplayName("7. Student role forbidden on /api/admin/categories and /api/admin/subjects (403)")
    void testStudentForbiddenOnAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/categories")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/admin/subjects")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}

