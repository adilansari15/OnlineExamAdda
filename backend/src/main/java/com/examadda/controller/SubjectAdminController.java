package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.SubjectRequest;
import com.examadda.dto.SubjectResponse;
import com.examadda.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subjects")
@RequiredArgsConstructor
public class SubjectAdminController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getSubjects(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        List<SubjectResponse> subjects = subjectService.getSubjects(categoryId, search);
        return ResponseEntity.ok(ApiResponse.ok(subjects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> getSubjectById(@PathVariable Long id) {
        SubjectResponse subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.ok(subject));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubjectResponse>> createSubject(
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse created = subjectService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Subject created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse updated = subjectService.updateSubject(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Subject updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.ok("Subject deleted successfully"));
    }
}
