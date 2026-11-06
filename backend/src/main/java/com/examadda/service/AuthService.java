package com.examadda.service;

import com.examadda.dto.AuthResponse;
import com.examadda.dto.LoginRequest;
import com.examadda.dto.RegisterRequest;
import com.examadda.dto.UserSummary;
import com.examadda.entity.Role;
import com.examadda.entity.RoleType;
import com.examadda.entity.User;
import com.examadda.exception.ConflictException;
import com.examadda.exception.ForbiddenException;
import com.examadda.exception.ResourceNotFoundException;
import com.examadda.exception.UnauthorizedException;
import com.examadda.repository.RoleRepository;
import com.examadda.repository.UserRepository;
import com.examadda.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already registered: " + normalizedEmail);
        }

        Role studentRole = roleRepository.findByName(RoleType.ROLE_STUDENT.name())
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(RoleType.ROLE_STUDENT.name())
                                .build()
                ));

        Set<Role> roles = new java.util.HashSet<>();
        roles.add(studentRole);

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .enabled(true)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                RoleType.ROLE_STUDENT.name()
        );
        Instant expiresAt = jwtService.extractExpiration(token);

        return new AuthResponse(
                token,
                expiresAt,
                toUserSummary(savedUser, RoleType.ROLE_STUDENT.name())
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().toLowerCase().trim();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (DisabledException e) {
            throw new ForbiddenException("Account is disabled. Please contact the administrator.");
        } catch (AuthenticationException e) {
            // Generic message prevents account enumeration
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ForbiddenException("Account is disabled. Please contact the administrator.");
        }

        String primaryRole = resolvePrimaryRole(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail(), primaryRole);
        Instant expiresAt = jwtService.extractExpiration(token);

        return new AuthResponse(
                token,
                expiresAt,
                toUserSummary(user, primaryRole)
        );
    }

    @Transactional(readOnly = true)
    public UserSummary getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return toUserSummary(user, resolvePrimaryRole(user));
    }

    private String resolvePrimaryRole(User user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> RoleType.ROLE_ADMIN.name().equals(r.getName()));
        return isAdmin ? RoleType.ROLE_ADMIN.name() : RoleType.ROLE_STUDENT.name();
    }

    private UserSummary toUserSummary(User user, String primaryRole) {
        return new UserSummary(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                primaryRole,
                user.getPhone(),
                user.getAvatarUrl(),
                Boolean.TRUE.equals(user.getEnabled())
        );
    }
}
