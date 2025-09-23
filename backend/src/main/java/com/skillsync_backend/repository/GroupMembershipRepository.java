package com.skillsync_backend.repository;

import com.skillsync_backend.model.GroupMembership;
import com.skillsync_backend.model.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMembershipRepository extends JpaRepository<GroupMembership, UUID> {

    boolean existsByGroup_IdAndUser_Email(UUID groupId, String email);

    boolean existsByGroup_IdAndUser_EmailAndStatus(UUID groupId, String email, MembershipStatus status);

    Optional<GroupMembership> findByGroup_IdAndUser_Email(UUID groupId, String email);

    List<GroupMembership> findByGroup_IdAndStatus(UUID groupId, MembershipStatus status);

    List<GroupMembership> findByGroup_Id(UUID groupId);

    long countByGroup_IdAndRole(UUID groupId, com.skillsync_backend.model.GroupRole role);
}