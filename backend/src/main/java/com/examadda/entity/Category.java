package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "categories")
public class Category extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon", length = 100)
    private String icon;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subject> subjects = new ArrayList<>();
}

