package com.tinexus.tinexusflow.engine.state;

import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.repository.FlowStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class FlowStateManager {

    private final FlowStateRepository flowStateRepository;

    @Transactional(readOnly = true)
    public FlowState getOrCreateState(Long conversationId) {
        return flowStateRepository.findByConversationId(conversationId)
                .orElseGet(() -> FlowState.builder()
                        .conversationId(conversationId)
                        .currentNodeId(null)
                        .currentPath("")
                        .lastVisitedNodeId(null)
                        .build()
                );
    }

    @Transactional
    public FlowState saveState(FlowState flowState) {
        return flowStateRepository.save(flowState);
    }

    @Transactional
    public void deleteState(Long conversationId) {
        flowStateRepository.findByConversationId(conversationId)
                .ifPresent(flowStateRepository::delete);
    }
}
