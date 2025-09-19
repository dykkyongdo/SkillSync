package com.skillsync_backend.dto;

import com.skillsync_backend.model.GroupRole;
import com.skillsync_backend.model.MembershipStatus;
import lombok.*;

import java.util.UUID;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
    private UUID userId;
    private UUID membershipId;
    private String email;
    private GroupRole role;
    private MembershipStatus status;
    private Instant createdAt;
}
