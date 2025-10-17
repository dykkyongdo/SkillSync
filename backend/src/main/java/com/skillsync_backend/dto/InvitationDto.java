package com.skillsync_backend.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationDto {
    private UUID membershipId;
    private UUID groupId;
    private String groupName;
    private String groupDescription;
    private String inviterEmail;
    private String inviterName;
    private Instant sentAt;
}
