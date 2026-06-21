package com.tinexus.tinexusflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flow_states")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false, unique = true)
    private Long conversationId;

    @Column(name = "current_node_id")
    private Long currentNodeId;

    @Column(name = "current_path", columnDefinition = "TEXT")
    private String currentPath; // Comma-separated list of active node IDs in context

    @Column(name = "last_visited_node_id")
    private Long lastVisitedNodeId;
}
