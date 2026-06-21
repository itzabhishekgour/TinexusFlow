package com.tinexus.tinexusflow.repository;

import com.tinexus.tinexusflow.entity.FlowState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlowStateRepository extends JpaRepository<FlowState, Long> {
    Optional<FlowState> findByConversationId(Long conversationId);
    void deleteByConversationId(Long conversationId);
}
