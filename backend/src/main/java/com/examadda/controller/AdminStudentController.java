package com.examadda.controller;

import com.examadda.dto.ApiResponse;
import com.examadda.dto.PageResponse;
import com.examadda.dto.StudentDetailResponse;
import com.examadda.dto.StudentStatusRequest;
import com.examadda.dto.StudentSummaryResponse;
import com.examadda.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StudentSummaryResponse>>> getStudents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        PageResponse<StudentSummaryResponse> response = adminUserService.getStudents(q, enabled, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDetailResponse>> getStudentById(@PathVariable Long id) {
        StudentDetailResponse response = adminUserService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StudentSummaryResponse>> updateStudentStatus(
            @PathVariable Long id,
            @Valid @RequestBody StudentStatusRequest request) {
        StudentSummaryResponse updated = adminUserService.updateStudentStatus(id, request.getEnabled());
        return ResponseEntity.ok(ApiResponse.ok("Student status updated successfully", updated));
    }
}
