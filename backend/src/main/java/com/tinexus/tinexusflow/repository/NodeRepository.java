package com.tinexus.tinexusflow.repository;

import com.tinexus.tinexusflow.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node, Long> {
    List<Node> findByConversationId(Long conversationId);
    List<Node> findByParentId(Long parentId);
    long countByConversationIdAndNodeType(Long conversationId, Node.NodeType nodeType);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(n) FROM Node n WHERE n.conversationId = :conversationId AND n.id NOT IN (SELECT p.parentId FROM Node p WHERE p.conversationId = :conversationId AND p.parentId IS NOT NULL)")
    long countLeafNodesByConversationId(@org.springframework.data.repository.query.Param("conversationId") Long conversationId);

    void deleteByConversationId(Long conversationId);
}
