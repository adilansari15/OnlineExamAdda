package com.examadda.repository;

import com.examadda.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByCategoryId(Long categoryId);
    List<Subject> findByCategoryIdAndActiveTrue(Long categoryId);
    Optional<Subject> findBySlug(String slug);
    boolean existsByCategoryId(Long categoryId);
    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);
    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(Long categoryId, String name, Long id);
    long countByCategoryId(Long categoryId);
    List<Subject> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String name);
    List<Subject> findByNameContainingIgnoreCase(String name);
}

