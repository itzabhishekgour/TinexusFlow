package com.tinexus.tinexusflow.dto;

import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Long conversationId;
    private Node node;
    private FlowState flowState;
    private boolean isAmbiguous;
    private String ambiguityQuestion;
    private List<String> ambiguityOptions;
    private List<String> quickReplies;
}
