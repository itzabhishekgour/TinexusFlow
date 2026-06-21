package com.tinexus.tinexusflow.engine.intelligence;

import com.tinexus.tinexusflow.engine.core.PathEngine;
import com.tinexus.tinexusflow.entity.Node;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ContextResolver {

    private final PathEngine pathEngine;

    public List<Node> resolveContextNodes(Node currentNode, List<Node> allNodes) {
        if (currentNode == null) {
            return Collections.emptyList();
        }
        // Active context is strictly the root + path ancestors + current node
        return pathEngine.calculateCurrentPath(currentNode, allNodes);
    }
}
