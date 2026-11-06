package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.CategoryRequest;
import com.examadda.dto.CategoryResponse;
import com.examadda.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryAdminController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(required = false) String search) {
        List<CategoryResponse> categories = categoryService.getAllCategories(search);
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Category created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully"));
    }
}
