package com.tinexus.tinexusflow.engine.intelligence;

import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class AmbiguityResolver {

    public boolean isContinuationAmbiguous(String message, FlowState flowState, List<Node> allNodes) {
        String cleanMessage = message.trim().toLowerCase();
        
        // Only trigger ambiguity for generic "continue" or "go on" commands
        if (!cleanMessage.matches("^(continue|go on|proceed|next)$")) {
            return false;
        }

        Long currentNodeId = flowState.getCurrentNodeId();
        Long lastVisitedNodeId = flowState.getLastVisitedNodeId();

        if (currentNodeId == null || lastVisitedNodeId == null) {
            return false;
        }

        // If the user navigated up to an ancestor, and now wants to "continue", 
        // they might want to return to their deep leaf node (lastVisitedNodeId) 
        // OR continue fresh from the current node.
        if (!currentNodeId.equals(lastVisitedNodeId)) {
            boolean isLastVisitedDescendant = allNodes.stream()
                    .anyMatch(n -> n.getId().equals(lastVisitedNodeId) && 
                            (n.getPath().contains("/" + currentNodeId) || 
                             n.getPath().startsWith(currentNodeId + "/")));
            
            return isLastVisitedDescendant;
        }

        return false;
    }

    public String getAmbiguityQuestion() {
        return "I notice you navigated back up the conversation tree. What would you like to do?";
    }

    public List<String> getAmbiguityOptions(FlowState flowState, List<Node> allNodes) {
        Long lastVisitedId = flowState.getLastVisitedNodeId();
        String lastVisitedQuestion = allNodes.stream()
                .filter(n -> n.getId().equals(lastVisitedId))
                .map(Node::getQuestion)
                .findFirst()
                .orElse("previous topic");

        // Trim the question for UI display if needed
        if (lastVisitedQuestion.length() > 40) {
            lastVisitedQuestion = lastVisitedQuestion.substring(0, 37) + "...";
        }

        return Arrays.asList(
                "Resume previous sub-branch (Return to: \"" + lastVisitedQuestion + "\")",
                "Create a new branch here"
        );
    }
}
