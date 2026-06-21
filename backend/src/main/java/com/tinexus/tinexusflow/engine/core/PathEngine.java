package com.tinexus.tinexusflow.engine.core;

import com.tinexus.tinexusflow.entity.Node;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class PathEngine {

    public List<Node> calculateCurrentPath(Node currentNode, List<Node> allNodes) {
        if (currentNode == null) {
            return Collections.emptyList();
        }

        // Map all nodes by their ID for fast lookup
        Map<Long, Node> nodeMap = allNodes.stream()
                .collect(Collectors.toMap(Node::getId, node -> node));

        List<Node> pathNodes = new ArrayList<>();
        
        // Parse the materialized path, e.g., "/1/2" -> ancestor IDs: 1, 2
        String pathStr = currentNode.getPath();
        if (pathStr != null && !pathStr.equals("/")) {
            String[] parts = pathStr.split("/");
            for (String part : parts) {
                if (!part.trim().isEmpty()) {
                    try {
                        Long id = Long.parseLong(part);
                        Node ancestor = nodeMap.get(id);
                        if (ancestor != null) {
                            pathNodes.add(ancestor);
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        
        // Add the current node itself to the end of the path
        pathNodes.add(currentNode);
        
        // Sort by depth to ensure order from root to current node
        pathNodes.sort(Comparator.comparingInt(Node::getDepth));
        return pathNodes;
    }

    public List<Node> determineAncestors(Node node, List<Node> allNodes) {
        List<Node> path = calculateCurrentPath(node, allNodes);
        if (path.isEmpty()) {
            return Collections.emptyList();
        }
        // Ancestors are all nodes in path except the node itself (the last one)
        return path.subList(0, path.size() - 1);
    }

    public List<Node> determineDescendants(Node targetNode, List<Node> allNodes) {
        if (targetNode == null) {
            return Collections.emptyList();
        }
        
        // A node is a descendant if its path starts with targetNode.getPath() + "/" + targetNode.getId()
        String prefix = targetNode.getPath().equals("/")
                ? "/" + targetNode.getId()
                : targetNode.getPath() + "/" + targetNode.getId();

        return allNodes.stream()
                .filter(node -> node.getPath().startsWith(prefix))
                .collect(Collectors.toList());
    }
}
