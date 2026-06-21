package com.tinexus.tinexusflow;

import com.tinexus.tinexusflow.engine.core.PathEngine;
import com.tinexus.tinexusflow.engine.core.ReturnEngine;
import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ReturnEngineTest {

    private ReturnEngine returnEngine;
    private PathEngine pathEngine;

    @BeforeEach
    public void setUp() {
        pathEngine = new PathEngine();
        returnEngine = new ReturnEngine(pathEngine);
    }

    @Test
    public void testReturnToParent() {
        Node root = Node.builder().id(1L).depth(0).path("/").question("Root").build();
        Node child = Node.builder().id(2L).parentId(1L).depth(1).path("/1").question("Child").build();
        List<Node> allNodes = Arrays.asList(root, child);

        FlowState state = FlowState.builder()
                .conversationId(100L)
                .currentNodeId(2L)
                .currentPath("1,2")
                .build();

        FlowState updatedState = returnEngine.returnToParent(state, allNodes);

        assertEquals(1L, updatedState.getCurrentNodeId());
        assertEquals("1", updatedState.getCurrentPath());
        assertEquals(2L, updatedState.getLastVisitedNodeId());
    }

    @Test
    public void testReturnToRoot() {
        Node root = Node.builder().id(1L).depth(0).path("/").question("Root").build();
        Node child = Node.builder().id(2L).parentId(1L).depth(1).path("/1").question("Child").build();
        Node grandchild = Node.builder().id(3L).parentId(2L).depth(2).path("/1/2").question("Grandchild").build();
        List<Node> allNodes = Arrays.asList(root, child, grandchild);

        FlowState state = FlowState.builder()
                .conversationId(100L)
                .currentNodeId(3L)
                .currentPath("1,2,3")
                .build();

        FlowState updatedState = returnEngine.returnToRoot(state, allNodes);

        assertEquals(1L, updatedState.getCurrentNodeId());
        assertEquals("1", updatedState.getCurrentPath());
        assertEquals(3L, updatedState.getLastVisitedNodeId());
    }

    @Test
    public void testRestoreState() {
        Node root = Node.builder().id(1L).depth(0).path("/").question("Root").build();
        Node child1 = Node.builder().id(2L).parentId(1L).depth(1).path("/1").question("Child1").build();
        Node child2 = Node.builder().id(3L).parentId(1L).depth(1).path("/1").question("Child2").build();
        List<Node> allNodes = Arrays.asList(root, child1, child2);

        FlowState state = FlowState.builder()
                .conversationId(100L)
                .currentNodeId(2L)
                .currentPath("1,2")
                .build();

        FlowState updatedState = returnEngine.restoreState(state, 3L, allNodes);

        assertEquals(3L, updatedState.getCurrentNodeId());
        assertEquals("1,3", updatedState.getCurrentPath());
        assertEquals(2L, updatedState.getLastVisitedNodeId());
    }
}
