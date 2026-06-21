package com.tinexus.tinexusflow.engine.navigation;

import com.tinexus.tinexusflow.engine.core.ReturnEngine;
import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FlowNavigator {

    private final ReturnEngine returnEngine;

    public FlowState navigateToNode(FlowState flowState, Long targetNodeId, List<Node> allNodes) {
        return returnEngine.restoreState(flowState, targetNodeId, allNodes);
    }

    public FlowState navigateToParent(FlowState flowState, List<Node> allNodes) {
        return returnEngine.returnToParent(flowState, allNodes);
    }

    public FlowState navigateToRoot(FlowState flowState, List<Node> allNodes) {
        return returnEngine.returnToRoot(flowState, allNodes);
    }
}
