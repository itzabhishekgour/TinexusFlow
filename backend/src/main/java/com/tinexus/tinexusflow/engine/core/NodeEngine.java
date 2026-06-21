package com.tinexus.tinexusflow.engine.core;

import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import com.tinexus.tinexusflow.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class NodeEngine {

    public Node createNode(Long conversationId, Long parentId, String question, String answer, NodeType nodeType, int depth, String path) {
        Node node = Node.builder()
                .conversationId(conversationId)
                .parentId(parentId)
                .question(question)
                .answer(answer)
                .nodeType(nodeType)
                .depth(depth)
                .path(path)
                .build();
        
        validateNode(node);
        return node;
    }

    public void validateNode(Node node) {
        if (node.getConversationId() == null) {
            throw new IllegalArgumentException("Conversation ID cannot be null");
        }
        if (node.getNodeType() == null) {
            throw new IllegalArgumentException("Node type cannot be null");
        }
        if (node.getDepth() < 0) {
            throw new IllegalArgumentException("Depth cannot be negative");
        }
        if (node.getNodeType() == NodeType.ROOT && node.getParentId() != null) {
            throw new IllegalArgumentException("Root node cannot have a parent");
        }
        if (node.getNodeType() != NodeType.ROOT && node.getParentId() == null) {
            throw new IllegalArgumentException("Non-root node must have a parent");
        }
        if (node.getQuestion() == null || node.getQuestion().trim().isEmpty()) {
            throw new IllegalArgumentException("Question cannot be empty");
        }
    }

    public void updateNode(Node node, String question, String answer) {
        node.setQuestion(question);
        node.setAnswer(answer);
        validateNode(node);
    }
}
