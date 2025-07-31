package com.skillsync_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Table(name = "users")

public class User {

    @Id                                                 // Primary key of the entity
    @GeneratedValue(strategy = GenerationType.UUID)     // automatically generate a random UUID when a new User is saved
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
