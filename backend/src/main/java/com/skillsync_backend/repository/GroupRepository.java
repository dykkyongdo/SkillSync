package com.skillsync_backend.repository;

import com.skillsync_backend.model.Group;
import com.skillsync_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {
    List<Group> findAllByMembersContaining(User user);
}
