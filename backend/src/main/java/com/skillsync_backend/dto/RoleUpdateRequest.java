package com.skillsync_backend.dto;

import com.skillsync_backend.model.GroupRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleUpdateRequest {
    @NotNull
    private GroupRole role;
}
