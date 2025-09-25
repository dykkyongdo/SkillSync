package com.skillsync_backend.dto;

import com.skillsync_backend.model.GroupRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class GroupResponse {
    private UUID groupId;
    private String name;
    private String description;
    private Instant createdAt;

    @Data
    @Builder
    public static class CreatedBy {
        private UUID id;
        private String email;
        private String appRole;
    }
    private CreatedBy createdBy;

    private GroupRole currentUserGroupRole;
}
