package com.examadda.service;

import com.examadda.dto.PasswordChangeRequest;
import com.examadda.dto.UserProfileRequest;
import com.examadda.dto.UserProfileResponse;
import com.examadda.entity.Role;
import com.examadda.entity.User;
import com.examadda.exception.ApiException;
import com.examadda.exception.ErrorCode;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String role = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("ROLE_STUDENT");

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(role)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone() != null ? request.phone().trim() : null);
        user.setAvatarUrl(request.avatarUrl() != null ? request.avatarUrl().trim() : null);

        User saved = userRepository.save(user);

        String role = saved.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("ROLE_STUDENT");

        return UserProfileResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .avatarUrl(saved.getAvatarUrl())
                .role(role)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}

