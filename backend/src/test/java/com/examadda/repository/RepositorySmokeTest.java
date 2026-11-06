package com.examadda.repository;

import com.examadda.ExamAddaApplication;
import com.examadda.entity.*;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class RepositorySmokeTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

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
    private PasswordEncoder passwordEncoder;

    @BeforeAll
    static void setup() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @Test
    @DisplayName("Flyway V1 and V2 migrations applied, roles and 12 categories are present")
    void testFlywaySeedData() {
        List<Category> categories = categoryRepository.findAllByActiveTrue();
        assertThat(categories).hasSizeGreaterThanOrEqualTo(12);

        Optional<Role> studentRole = roleRepository.findByName(RoleType.ROLE_STUDENT.name());
        Optional<Role> adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.name());
        assertThat(studentRole).isPresent();
        assertThat(adminRole).isPresent();

        Optional<User> adminUser = userRepository.findByEmail("admin@examadda.local");
        assertThat(adminUser).isPresent();
        assertThat(adminUser.get().getRoles()).extracting(Role::getName)
                .contains(RoleType.ROLE_ADMIN.name());
    }

    @Test
    @DisplayName("Smoke test: Create, persist, and retrieve User, Category, Quiz, and Question")
    void testSaveAndReadUserCategoryQuiz() {
        Role studentRole = roleRepository.findByName(RoleType.ROLE_STUDENT.name()).orElseThrow();

        // 1. Create and persist User
        User student = User.builder()
                .fullName("John Doe")
                .email("john.doe@test.local")
                .passwordHash(passwordEncoder.encode("SecretPass123"))
                .enabled(true)
                .roles(Set.of(studentRole))
                .build();
        User savedStudent = userRepository.save(student);
        assertThat(savedStudent.getId()).isNotNull();

        // 2. Fetch seeded Category and Subject
        Category javaCategory = categoryRepository.findBySlug("java-programming").orElseThrow();
        List<Subject> subjects = subjectRepository.findByCategoryIdAndActiveTrue(javaCategory.getId());
        assertThat(subjects).isNotEmpty();
        Subject subject = subjects.getFirst();

        // 3. Create and persist Question with 4 options
        Question question = Question.builder()
                .subject(subject)
                .text("What is the default value of boolean in Java?")
                .explanation("In Java, primitive boolean fields default to false.")
                .difficulty(Difficulty.EASY)
                .active(true)
                .createdBy(savedStudent)
                .build();
        Question savedQuestion = questionRepository.save(question);

        QuestionOption opt1 = QuestionOption.builder()
                .question(savedQuestion)
                .optionText("true")
                .isCorrect(false)
                .position((byte) 1)
                .build();
        QuestionOption opt2 = QuestionOption.builder()
                .question(savedQuestion)
                .optionText("false")
                .isCorrect(true)
                .position((byte) 2)
                .build();
        QuestionOption opt3 = QuestionOption.builder()
                .question(savedQuestion)
                .optionText("null")
                .isCorrect(false)
                .position((byte) 3)
                .build();
        QuestionOption opt4 = QuestionOption.builder()
                .question(savedQuestion)
                .optionText("0")
                .isCorrect(false)
                .position((byte) 4)
                .build();
        questionOptionRepository.saveAll(List.of(opt1, opt2, opt3, opt4));

        List<QuestionOption> options = questionOptionRepository.findByQuestionIdOrderByPositionAsc(savedQuestion.getId());
        assertThat(options).hasSize(4);
        assertThat(options.stream().filter(QuestionOption::getIsCorrect).count()).isEqualTo(1);

        // 4. Create and persist Quiz
        Quiz quiz = Quiz.builder()
                .category(javaCategory)
                .title("Java Basics Certification Quiz")
                .description("Test your basic Java knowledge")
                .difficulty(Difficulty.EASY)
                .durationMinutes(30)
                .marksPerQuestion(new BigDecimal("4.00"))
                .negativeMarks(new BigDecimal("1.00"))
                .totalMarks(new BigDecimal("4.00"))
                .passingMarks(new BigDecimal("2.00"))
                .status(QuizStatus.PUBLISHED)
                .createdBy(savedStudent)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz);
        assertThat(savedQuiz.getId()).isNotNull();

        // 5. Query back and assert
        Optional<Quiz> foundQuiz = quizRepository.findById(savedQuiz.getId());
        assertThat(foundQuiz).isPresent();
        assertThat(foundQuiz.get().getTitle()).isEqualTo("Java Basics Certification Quiz");
        assertThat(foundQuiz.get().getCategory().getName()).isEqualTo("Java Programming");
        assertThat(foundQuiz.get().getStatus()).isEqualTo(QuizStatus.PUBLISHED);
    }
}

