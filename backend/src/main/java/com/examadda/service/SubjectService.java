package com.examadda.service;

import com.examadda.dto.SubjectRequest;
import com.examadda.dto.SubjectResponse;
import com.examadda.entity.Category;
import com.examadda.entity.Subject;
import com.examadda.exception.ConflictException;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.CategoryRepository;
import com.examadda.repository.QuestionRepository;
import com.examadda.repository.SubjectRepository;
import com.examadda.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjects(Long categoryId, String search) {
        List<Subject> subjects;
        boolean hasCategory = categoryId != null;
        boolean hasSearch = search != null && !search.isBlank();

        if (hasCategory && hasSearch) {
            subjects = subjectRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, search.trim());
        } else if (hasCategory) {
            subjects = subjectRepository.findByCategoryId(categoryId);
        } else if (hasSearch) {
            subjects = subjectRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            subjects = subjectRepository.findAll();
        }

        return subjects.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public SubjectResponse getSubjectById(Long id) {
        Subject subject = findSubjectEntity(id);
        return mapToResponse(subject);
    }

    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String trimmedName = request.getName().trim();
        if (subjectRepository.existsByCategoryIdAndNameIgnoreCase(category.getId(), trimmedName)) {
            throw new ConflictException("Subject with name '" + trimmedName + "' already exists in category '" + category.getName() + "'");
        }

        String slug = SlugUtils.toSlug(trimmedName);

        Subject subject = Subject.builder()
                .category(category)
                .name(trimmedName)
                .slug(slug)
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Subject saved = subjectRepository.save(subject);
        return mapToResponse(saved);
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = findSubjectEntity(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String trimmedName = request.getName().trim();
        if (subjectRepository.existsByCategoryIdAndNameIgnoreCaseAndIdNot(category.getId(), trimmedName, id)) {
            throw new ConflictException("Subject with name '" + trimmedName + "' already exists in category '" + category.getName() + "'");
        }

        subject.setCategory(category);
        subject.setName(trimmedName);
        subject.setSlug(SlugUtils.toSlug(trimmedName));
        subject.setDescription(request.getDescription());
        if (request.getActive() != null) {
            subject.setActive(request.getActive());
        }

        Subject updated = subjectRepository.save(subject);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = findSubjectEntity(id);

        if (questionRepository.existsBySubjectId(id)) {
            throw new ConflictException("Cannot delete subject '" + subject.getName() + "' because it has associated questions");
        }

        subjectRepository.delete(subject);
    }

    private Subject findSubjectEntity(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
    }

    private SubjectResponse mapToResponse(Subject subject) {
        long questionCount = questionRepository.countBySubjectId(subject.getId());
        return SubjectResponse.builder()
                .id(subject.getId())
                .categoryId(subject.getCategory().getId())
                .categoryName(subject.getCategory().getName())
                .name(subject.getName())
                .slug(subject.getSlug())
                .description(subject.getDescription())
                .active(subject.getActive())
                .questionCount(questionCount)
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }
}

