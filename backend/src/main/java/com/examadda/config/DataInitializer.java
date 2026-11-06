package com.examadda.config;

import com.examadda.entity.Role;
import com.examadda.entity.RoleType;
import com.examadda.entity.User;
import com.examadda.repository.RoleRepository;
import com.examadda.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@examadda.local}")
    private String adminEmail;

    @Value("${app.admin.password:Zehra@2305}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.name())
                    .orElseGet(() -> roleRepository.save(
                            Role.builder()
                                    .name(RoleType.ROLE_ADMIN.name())
                                    .build()
                    ));

            User admin = User.builder()
                    .fullName("Platform Administrator")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .enabled(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("Initialized default administrator account: {}", adminEmail);
        } else {
            log.debug("Administrator account already exists: {}", adminEmail);
        }
    }
}

