package com.tinexus.tinexusflow.engine.core;

import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReturnEngine {

    private final PathEngine pathEngine;

    public FlowState returnToParent(FlowState flowState, List<Node> allNodes) {
        Long currentNodeId = flowState.getCurrentNodeId();
        if (currentNodeId == null) {
            throw new IllegalStateException("Cannot navigate: No current node is set.");
        }

        Map<Long, Node> nodeMap = allNodes.stream()
                .collect(Collectors.toMap(Node::getId, n -> n));

        Node currentNode = nodeMap.get(currentNodeId);
        if (currentNode == null) {
            throw new ResourceNotFoundException("Current node not found in conversation nodes.");
        }

        Long parentId = currentNode.getParentId();
        if (parentId == null) {
            // Already at root, parent is root itself or no parent. Let's keep it here.
            return flowState;
        }

        Node parentNode = nodeMap.get(parentId);
        if (parentNode == null) {
            throw new ResourceNotFoundException("Parent node not found.");
        }

        // Calculate new current path
        List<Node> newPathNodes = pathEngine.calculateCurrentPath(parentNode, allNodes);
        String newPathStr = newPathNodes.stream()
                .map(n -> String.valueOf(n.getId()))
                .collect(Collectors.joining(","));

        // Update state
        flowState.setLastVisitedNodeId(currentNodeId);
        flowState.setCurrentNodeId(parentNode.getId());
        flowState.setCurrentPath(newPathStr);

        return flowState;
    }

    public FlowState returnToRoot(FlowState flowState, List<Node> allNodes) {
        Long currentNodeId = flowState.getCurrentNodeId();
        
        Node rootNode = allNodes.stream()
                .filter(n -> n.getParentId() == null)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Root node not found for this conversation."));

        if (rootNode.getId().equals(currentNodeId)) {
            // Already at root
            return flowState;
        }

        // New path contains just the root node
        String newPathStr = String.valueOf(rootNode.getId());

        flowState.setLastVisitedNodeId(currentNodeId);
        flowState.setCurrentNodeId(rootNode.getId());
        flowState.setCurrentPath(newPathStr);

        return flowState;
    }

    public FlowState restoreState(FlowState flowState, Long targetNodeId, List<Node> allNodes) {
        Node targetNode = allNodes.stream()
                .filter(n -> n.getId().equals(targetNodeId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Target node " + targetNodeId + " not found."));

        List<Node> pathNodes = pathEngine.calculateCurrentPath(targetNode, allNodes);
        String pathStr = pathNodes.stream()
                .map(n -> String.valueOf(n.getId()))
                .collect(Collectors.joining(","));

        flowState.setLastVisitedNodeId(flowState.getCurrentNodeId());
        flowState.setCurrentNodeId(targetNode.getId());
        flowState.setCurrentPath(pathStr);

        return flowState;
    }
}
