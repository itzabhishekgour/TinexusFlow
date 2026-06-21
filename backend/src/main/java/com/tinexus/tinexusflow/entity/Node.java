package com.tinexus.tinexusflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(name = "node_type", nullable = false)
    private NodeType nodeType;

    @Column(nullable = false)
    private Integer depth;

    @Column(nullable = false)
    private String path; // Materialized path, e.g., "/1/2/5"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Convert(converter = StringListConverter.class)
    @Column(name = "quick_replies", columnDefinition = "TEXT")
    private java.util.List<String> quickReplies;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum NodeType {
        ROOT,
        CLARIFICATION,
        CONTINUATION
    }
}
