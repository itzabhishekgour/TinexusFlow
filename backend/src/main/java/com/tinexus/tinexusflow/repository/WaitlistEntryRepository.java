package com.tinexus.tinexusflow.repository;

import com.tinexus.tinexusflow.entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {
    boolean existsByEmail(String email);
}
