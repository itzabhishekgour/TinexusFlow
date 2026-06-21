package com.tinexus.tinexusflow.engine.core;

import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BranchEngine {

    private final NodeEngine nodeEngine;

    public Node createBranch(Long conversationId, Node parentNode, String question, String answer, NodeType nodeType) {
        if (parentNode == null) {
            // Root Node creation
            return nodeEngine.createNode(
                    conversationId,
                    null,
                    question,
                    answer,
                    NodeType.ROOT,
                    0,
                    "/" // Root starts with just "/"
            );
        }

        // Child node path calculation: e.g. parentPath = "/1", child path = "/1/2"
        String parentPath = parentNode.getPath();
        String currentPath = parentPath.equals("/") 
                ? "/" + parentNode.getId() 
                : parentPath + "/" + parentNode.getId();

        return nodeEngine.createNode(
                conversationId,
                parentNode.getId(),
                question,
                answer,
                nodeType,
                parentNode.getDepth() + 1,
                currentPath
        );
    }
}
