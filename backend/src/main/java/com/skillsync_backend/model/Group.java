package com.skillsync_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;
import java.time.Instant;

@Entity
@Table(name = "user_groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String description;

    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by")        // creator user id
    private User createdBy;
}
