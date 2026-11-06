package com.examadda.repository;

import com.examadda.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRolesName(String roleName);
    List<User> findTop5ByRolesNameOrderByCreatedAtDesc(String roleName);
}

