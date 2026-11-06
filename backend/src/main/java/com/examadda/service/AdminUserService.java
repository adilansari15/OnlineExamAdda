package com.examadda.service;

import com.examadda.dto.*;
import com.examadda.entity.*;
import com.examadda.exception.ApiException;
import com.examadda.exception.ErrorCode;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<StudentSummaryResponse> getStudents(String q, Boolean enabled, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join roles to filter students
            Join<User, Role> roleJoin = root.join("roles");
            predicates.add(cb.equal(roleJoin.get("name"), RoleType.ROLE_STUDENT.name()));

            if (q != null && !q.isBlank()) {
                String search = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), search),
                        cb.like(cb.lower(root.get("email")), search)
                ));
            }

            if (enabled != null) {
                predicates.add(cb.equal(root.get("enabled"), enabled));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StudentSummaryResponse> page = userRepository.findAll(spec, pageable)
                .map(this::mapToStudentSummary);

        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public StudentDetailResponse getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        boolean isStudent = user.getRoles().stream()
                .anyMatch(r -> RoleType.ROLE_STUDENT.name().equals(r.getName()));

        if (!isStudent) {
            throw new ResourceNotFoundException("Student", "id", id);
        }

        long totalAttempts = examAttemptRepository.countByUserId(user.getId());
        long completedAttempts = examAttemptRepository.countByUserIdAndStatus(user.getId(), AttemptStatus.SUBMITTED)
                + examAttemptRepository.countByUserIdAndStatus(user.getId(), AttemptStatus.AUTO_SUBMITTED);

        return StudentDetailResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .enabled(user.getEnabled())
                .totalAttempts(totalAttempts)
                .completedAttempts(completedAttempts)
                .averageScore(BigDecimal.ZERO) // populated in Phase 6 when results exist
                .recentAttempts(List.of())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Transactional
    public StudentSummaryResponse updateStudentStatus(Long id, Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        user.setEnabled(Boolean.TRUE.equals(enabled));
        User saved = userRepository.save(user);
        return mapToStudentSummary(saved);
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalStudents = userRepository.countByRolesName(RoleType.ROLE_STUDENT.name());
        long totalQuizzes = quizRepository.count();
        long totalQuestions = questionRepository.count();
        long totalAttempts = examAttemptRepository.count();
        long publishedQuizzes = quizRepository.countByStatus(QuizStatus.PUBLISHED);
        long draftQuizzes = quizRepository.countByStatus(QuizStatus.DRAFT);
        long activeCategories = categoryRepository.findAllByActiveTrue().size();

        // Build recent activities from recent students and quizzes
        List<AdminDashboardResponse.DashboardActivityItem> activityItems = new ArrayList<>();

        List<User> recentStudents = userRepository.findTop5ByRolesNameOrderByCreatedAtDesc(RoleType.ROLE_STUDENT.name());
        for (User u : recentStudents) {
            activityItems.add(AdminDashboardResponse.DashboardActivityItem.builder()
                    .id("student-" + u.getId())
                    .type("STUDENT_REGISTERED")
                    .title("New Student Enrolled")
                    .description(u.getFullName() + " (" + u.getEmail() + ") registered")
                    .timestamp(u.getCreatedAt())
                    .build());
        }

        List<Quiz> recentQuizzes = quizRepository.findTop5ByOrderByCreatedAtDesc();
        for (Quiz q : recentQuizzes) {
            activityItems.add(AdminDashboardResponse.DashboardActivityItem.builder()
                    .id("quiz-" + q.getId())
                    .type("QUIZ_CREATED")
                    .title("Quiz Created: " + q.getTitle())
                    .description("Status: " + q.getStatus() + " | Category: " + q.getCategory().getName())
                    .timestamp(q.getCreatedAt())
                    .build());
        }

        // Sort descending by timestamp
        activityItems.sort(Comparator.comparing(AdminDashboardResponse.DashboardActivityItem::getTimestamp,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return AdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalQuizzes(totalQuizzes)
                .totalQuestions(totalQuestions)
                .totalAttempts(totalAttempts)
                .publishedQuizzes(publishedQuizzes)
                .draftQuizzes(draftQuizzes)
                .activeCategories(activeCategories)
                .recentActivity(activityItems)
                .build();
    }

    @Transactional
    public void changeAdminPassword(String email, PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private StudentSummaryResponse mapToStudentSummary(User user) {
        long totalAttempts = examAttemptRepository.countByUserId(user.getId());
        return StudentSummaryResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .enabled(user.getEnabled())
                .totalAttempts(totalAttempts)
                .createdAt(user.getCreatedAt())
                .build();
    }
}

