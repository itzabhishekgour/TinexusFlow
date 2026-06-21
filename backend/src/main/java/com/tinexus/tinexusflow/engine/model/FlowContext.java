package com.tinexus.tinexusflow.engine.model;

import com.tinexus.tinexusflow.entity.Conversation;
import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowContext {
    private Conversation conversation;
    private FlowState flowState;
    private List<Node> activePathNodes;
    private List<Node> allNodes;
}
