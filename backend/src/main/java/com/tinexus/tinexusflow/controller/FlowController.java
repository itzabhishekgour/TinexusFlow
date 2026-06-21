package com.tinexus.tinexusflow.controller;

import com.tinexus.tinexusflow.dto.BranchRequest;
import com.tinexus.tinexusflow.dto.ChatResponse;
import com.tinexus.tinexusflow.dto.NavigationRequest;
import com.tinexus.tinexusflow.engine.core.BranchEngine;
import com.tinexus.tinexusflow.engine.core.PathEngine;
import com.tinexus.tinexusflow.engine.navigation.FlowNavigator;
import com.tinexus.tinexusflow.engine.state.FlowStateManager;
import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import com.tinexus.tinexusflow.exception.ResourceNotFoundException;
import com.tinexus.tinexusflow.repository.NodeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flow")
@RequiredArgsConstructor
public class FlowController {

    private final NodeRepository nodeRepository;
    private final FlowStateManager flowStateManager;
    private final BranchEngine branchEngine;
    private final PathEngine pathEngine;
    private final FlowNavigator flowNavigator;

    @PostMapping("/branch")
    public ResponseEntity<ChatResponse> createManualBranch(@Valid @RequestBody BranchRequest request) {
        Long conversationId = request.getConversationId();
        List<Node> allNodes = nodeRepository.findByConversationId(conversationId);
        
        Node parentNode = allNodes.stream()
                .filter(n -> n.getId().equals(request.getParentId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Parent node not found"));

        Node newBranchNode = branchEngine.createBranch(
                conversationId,
                parentNode,
                request.getQuestion(),
                request.getAnswer(),
                NodeType.CLARIFICATION
        );
        newBranchNode = nodeRepository.save(newBranchNode);

        // Update active flow state
        allNodes.add(newBranchNode);
        List<Node> newPathNodes = pathEngine.calculateCurrentPath(newBranchNode, allNodes);
        String newPathStr = newPathNodes.stream()
                .map(n -> String.valueOf(n.getId()))
                .collect(Collectors.joining(","));

        FlowState flowState = flowStateManager.getOrCreateState(conversationId);
        flowState.setLastVisitedNodeId(flowState.getCurrentNodeId());
        flowState.setCurrentNodeId(newBranchNode.getId());
        flowState.setCurrentPath(newPathStr);
        flowState = flowStateManager.saveState(flowState);

        return ResponseEntity.ok(ChatResponse.builder()
                .conversationId(conversationId)
                .node(newBranchNode)
                .flowState(flowState)
                .isAmbiguous(false)
                .build());
    }

    @PostMapping("/return-parent")
    public ResponseEntity<FlowState> returnToParent(@RequestBody Map<String, Long> payload) {
        Long conversationId = payload.get("conversationId");
        if (conversationId == null) {
            throw new IllegalArgumentException("Conversation ID is required");
        }

        List<Node> allNodes = nodeRepository.findByConversationId(conversationId);
        FlowState flowState = flowStateManager.getOrCreateState(conversationId);
        
        flowState = flowNavigator.navigateToParent(flowState, allNodes);
        flowState = flowStateManager.saveState(flowState);

        return ResponseEntity.ok(flowState);
    }

    @PostMapping("/return-root")
    public ResponseEntity<FlowState> returnToRoot(@RequestBody Map<String, Long> payload) {
        Long conversationId = payload.get("conversationId");
        if (conversationId == null) {
            throw new IllegalArgumentException("Conversation ID is required");
        }

        List<Node> allNodes = nodeRepository.findByConversationId(conversationId);
        FlowState flowState = flowStateManager.getOrCreateState(conversationId);

        flowState = flowNavigator.navigateToRoot(flowState, allNodes);
        flowState = flowStateManager.saveState(flowState);

        return ResponseEntity.ok(flowState);
    }

    @PostMapping("/navigate")
    public ResponseEntity<FlowState> navigateToNode(@Valid @RequestBody NavigationRequest request) {
        Long conversationId = request.getConversationId();
        Long targetNodeId = request.getTargetNodeId();

        List<Node> allNodes = nodeRepository.findByConversationId(conversationId);
        FlowState flowState = flowStateManager.getOrCreateState(conversationId);

        flowState = flowNavigator.navigateToNode(flowState, targetNodeId, allNodes);
        flowState = flowStateManager.saveState(flowState);

        return ResponseEntity.ok(flowState);
    }

    @GetMapping("/tree/{conversationId}")
    public ResponseEntity<Map<String, Object>> getTree(@PathVariable Long conversationId) {
        List<Node> nodes = nodeRepository.findByConversationId(conversationId);
        FlowState flowState = flowStateManager.getOrCreateState(conversationId);

        Map<String, Object> response = new HashMap<>();
        response.put("nodes", nodes);
        response.put("flowState", flowState);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/path/{conversationId}")
    public ResponseEntity<List<Node>> getPath(@PathVariable Long conversationId) {
        List<Node> allNodes = nodeRepository.findByConversationId(conversationId);
        FlowState flowState = flowStateManager.getOrCreateState(conversationId);

        if (flowState.getCurrentNodeId() == null) {
            return ResponseEntity.ok(List.of());
        }

        Node currentNode = allNodes.stream()
                .filter(n -> n.getId().equals(flowState.getCurrentNodeId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Current node not found"));

        List<Node> pathNodes = pathEngine.calculateCurrentPath(currentNode, allNodes);
        return ResponseEntity.ok(pathNodes);
    }
}
