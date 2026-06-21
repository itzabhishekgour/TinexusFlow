package com.tinexus.tinexusflow;

import com.tinexus.tinexusflow.engine.core.NodeEngine;
import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class NodeEngineTest {

    private NodeEngine nodeEngine;

    @BeforeEach
    public void setUp() {
        nodeEngine = new NodeEngine();
    }

    @Test
    public void testCreateRootNodeValid() {
        Node node = nodeEngine.createNode(1L, null, "What is AI?", "AI stands for...", NodeType.ROOT, 0, "/");
        assertNotNull(node);
        assertEquals(NodeType.ROOT, node.getNodeType());
        assertNull(node.getParentId());
        assertEquals(0, node.getDepth());
    }

    @Test
    public void testCreateRootWithParentThrows() {
        assertThrows(IllegalArgumentException.class, () -> 
            nodeEngine.createNode(1L, 2L, "What is AI?", "AI stands for...", NodeType.ROOT, 0, "/")
        );
    }

    @Test
    public void testCreateNonRootWithoutParentThrows() {
        assertThrows(IllegalArgumentException.class, () -> 
            nodeEngine.createNode(1L, null, "Tell me more?", "Yes...", NodeType.CLARIFICATION, 1, "/1")
        );
    }

    @Test
    public void testEmptyQuestionThrows() {
        assertThrows(IllegalArgumentException.class, () -> 
            nodeEngine.createNode(1L, null, "", "Answer", NodeType.ROOT, 0, "/")
        );
    }

    @Test
    public void testUpdateNode() {
        Node node = nodeEngine.createNode(1L, null, "What is AI?", "AI is...", NodeType.ROOT, 0, "/");
        nodeEngine.updateNode(node, "Updated Q", "Updated A");
        assertEquals("Updated Q", node.getQuestion());
        assertEquals("Updated A", node.getAnswer());
    }
}
