package com.tinexus.tinexusflow;

import com.tinexus.tinexusflow.engine.core.BranchEngine;
import com.tinexus.tinexusflow.engine.core.NodeEngine;
import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class BranchEngineTest {

    private BranchEngine branchEngine;
    private NodeEngine nodeEngine;

    @BeforeEach
    public void setUp() {
        nodeEngine = new NodeEngine();
        branchEngine = new BranchEngine(nodeEngine);
    }

    @Test
    public void testCreateRootBranch() {
        Node root = branchEngine.createBranch(1L, null, "Root Q", "Root A", NodeType.ROOT);
        assertNotNull(root);
        assertEquals("/", root.getPath());
        assertEquals(0, root.getDepth());
    }

    @Test
    public void testCreateChildBranch() {
        Node parent = Node.builder()
                .id(10L)
                .conversationId(1L)
                .parentId(null)
                .question("Parent Q")
                .answer("Parent A")
                .nodeType(NodeType.ROOT)
                .depth(0)
                .path("/")
                .build();

        Node child = branchEngine.createBranch(1L, parent, "Child Q", "Child A", NodeType.CLARIFICATION);
        
        assertNotNull(child);
        assertEquals(10L, child.getParentId());
        assertEquals(1, child.getDepth());
        assertEquals("/10", child.getPath());
    }

    @Test
    public void testCreateNestedChildBranch() {
        Node parent = Node.builder()
                .id(20L)
                .conversationId(1L)
                .parentId(10L)
                .question("Parent Q")
                .answer("Parent A")
                .nodeType(NodeType.CLARIFICATION)
                .depth(1)
                .path("/10")
                .build();

        Node grandchild = branchEngine.createBranch(1L, parent, "Grandchild Q", "Grandchild A", NodeType.CONTINUATION);
        
        assertNotNull(grandchild);
        assertEquals(20L, grandchild.getParentId());
        assertEquals(2, grandchild.getDepth());
        assertEquals("/10/20", grandchild.getPath());
    }
}
