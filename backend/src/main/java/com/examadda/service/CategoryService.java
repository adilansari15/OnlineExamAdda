package com.examadda.service;

import com.examadda.dto.CategoryRequest;
import com.examadda.dto.CategoryResponse;
import com.examadda.entity.Category;
import com.examadda.exception.ConflictException;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.CategoryRepository;
import com.examadda.repository.QuizRepository;
import com.examadda.repository.SubjectRepository;
import com.examadda.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubjectRepository subjectRepository;
    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(String search) {
        List<Category> categories;
        if (search != null && !search.isBlank()) {
            categories = categoryRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            categories = categoryRepository.findAll();
        }
        return categories.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategoryEntity(id);
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new ConflictException("Category with name '" + trimmedName + "' already exists");
        }

        String baseSlug = SlugUtils.toSlug(trimmedName);
        String finalSlug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(finalSlug)) {
            finalSlug = baseSlug + "-" + counter++;
        }

        Category category = Category.builder()
                .name(trimmedName)
                .slug(finalSlug)
                .description(request.getDescription())
                .icon(request.getIcon())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryEntity(id);
        String trimmedName = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new ConflictException("Category with name '" + trimmedName + "' already exists");
        }

        if (!category.getName().equalsIgnoreCase(trimmedName)) {
            String baseSlug = SlugUtils.toSlug(trimmedName);
            String finalSlug = baseSlug;
            int counter = 1;
            while (categoryRepository.existsBySlugAndIdNot(finalSlug, id)) {
                finalSlug = baseSlug + "-" + counter++;
            }
            category.setSlug(finalSlug);
        }

        category.setName(trimmedName);
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryEntity(id);

        if (subjectRepository.existsByCategoryId(id)) {
            throw new ConflictException("Cannot delete category '" + category.getName() + "' because it has associated subjects");
        }

        if (quizRepository.existsByCategoryId(id)) {
            throw new ConflictException("Cannot delete category '" + category.getName() + "' because it is referenced by existing quizzes");
        }

        categoryRepository.delete(category);
    }

    private Category findCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private CategoryResponse mapToResponse(Category category) {
        long subjectCount = subjectRepository.countByCategoryId(category.getId());
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .icon(category.getIcon())
                .active(category.getActive())
                .subjectCount(subjectCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}

