package com.examadda.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;
}

