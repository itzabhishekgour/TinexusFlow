package com.tinexus.tinexusflow.engine.model;

import com.tinexus.tinexusflow.entity.Node;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NavigationPath {
    private List<Node> nodes;
    private Node currentNode;
    private Node rootNode;

    public boolean isEmpty() {
        return nodes == null || nodes.isEmpty();
    }

    public int size() {
        return nodes != null ? nodes.size() : 0;
    }
}
