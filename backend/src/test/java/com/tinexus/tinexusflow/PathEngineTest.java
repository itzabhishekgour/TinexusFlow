package com.tinexus.tinexusflow;

import com.tinexus.tinexusflow.engine.core.PathEngine;
import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class PathEngineTest {

    private PathEngine pathEngine;

    @BeforeEach
    public void setUp() {
        pathEngine = new PathEngine();
    }

    @Test
    public void testCalculateCurrentPath() {
        Node n1 = Node.builder().id(1L).depth(0).path("/").question("Q1").build();
        Node n2 = Node.builder().id(2L).depth(1).path("/1").question("Q2").build();
        Node n3 = Node.builder().id(3L).depth(2).path("/1/2").question("Q3").build();

        List<Node> allNodes = Arrays.asList(n1, n2, n3);

        List<Node> path = pathEngine.calculateCurrentPath(n3, allNodes);
        
        assertEquals(3, path.size());
        assertEquals(1L, path.get(0).getId());
        assertEquals(2L, path.get(1).getId());
        assertEquals(3L, path.get(2).getId());
    }

    @Test
    public void testDetermineAncestors() {
        Node n1 = Node.builder().id(1L).depth(0).path("/").question("Q1").build();
        Node n2 = Node.builder().id(2L).depth(1).path("/1").question("Q2").build();
        Node n3 = Node.builder().id(3L).depth(2).path("/1/2").question("Q3").build();

        List<Node> allNodes = Arrays.asList(n1, n2, n3);

        List<Node> ancestors = pathEngine.determineAncestors(n3, allNodes);
        
        assertEquals(2, ancestors.size());
        assertEquals(1L, ancestors.get(0).getId());
        assertEquals(2L, ancestors.get(1).getId());
    }

    @Test
    public void testDetermineDescendants() {
        Node n1 = Node.builder().id(1L).depth(0).path("/").question("Q1").build();
        Node n2 = Node.builder().id(2L).depth(1).path("/1").question("Q2").build();
        Node n3 = Node.builder().id(3L).depth(2).path("/1/2").question("Q3").build();
        Node n4 = Node.builder().id(4L).depth(2).path("/1/2").question("Q4").build();
        Node n5 = Node.builder().id(5L).depth(1).path("/1").question("Q5").build();

        List<Node> allNodes = Arrays.asList(n1, n2, n3, n4, n5);

        List<Node> descendants = pathEngine.determineDescendants(n2, allNodes);
        
        // n3 and n4 have prefix "/1/2" which matches target n2 (id=2, path=/1)
        assertEquals(2, descendants.size());
        assertTrue(descendants.stream().anyMatch(n -> n.getId().equals(3L)));
        assertTrue(descendants.stream().anyMatch(n -> n.getId().equals(4L)));
        assertFalse(descendants.stream().anyMatch(n -> n.getId().equals(5L)));
    }
}
