package com.tinexus.tinexusflow.service;

import com.tinexus.tinexusflow.dto.ChatRequest;
import com.tinexus.tinexusflow.dto.ChatResponse;
import com.tinexus.tinexusflow.dto.ConversationDto;
import com.tinexus.tinexusflow.engine.core.BranchEngine;
import com.tinexus.tinexusflow.engine.core.NodeEngine;
import com.tinexus.tinexusflow.engine.core.PathEngine;
import com.tinexus.tinexusflow.engine.intelligence.AmbiguityResolver;
import com.tinexus.tinexusflow.engine.intelligence.BranchDetector;
import com.tinexus.tinexusflow.engine.intelligence.BranchDetector.BranchType;
import com.tinexus.tinexusflow.engine.intelligence.IntentClassifier;
import com.tinexus.tinexusflow.engine.intelligence.IntentClassifier.Intent;
import com.tinexus.tinexusflow.engine.navigation.FlowNavigator;
import com.tinexus.tinexusflow.engine.state.FlowStateManager;
import com.tinexus.tinexusflow.entity.Conversation;
import com.tinexus.tinexusflow.entity.FlowState;
import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.entity.Node.NodeType;
import com.tinexus.tinexusflow.exception.ResourceNotFoundException;
import com.tinexus.tinexusflow.repository.ConversationRepository;
import com.tinexus.tinexusflow.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final NodeRepository nodeRepository;
    private final FlowStateManager flowStateManager;
    private final NodeEngine nodeEngine;
    private final BranchEngine branchEngine;
    private final PathEngine pathEngine;
    private final FlowNavigator flowNavigator;

    private final IntentClassifier intentClassifier;
    private final BranchDetector branchDetector;
    private final AmbiguityResolver ambiguityResolver;
    private final ContextBuilderService contextBuilderService;
    private final LLMService llmService;

    private record ParsedAiResponse(String cleanAnswer, List<String> quickReplies) {}

    private ParsedAiResponse parseAiResponse(String rawResponse) {
        if (rawResponse == null) {
            return new ParsedAiResponse("", null);
        }
        
        String startTag = "[QUICK_REPLIES]";
        String endTag = "[/QUICK_REPLIES]";
        
        int startIndex = rawResponse.indexOf(startTag);
        int endIndex = rawResponse.indexOf(endTag);
        
        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
            String cleanText = rawResponse.substring(0, startIndex).trim();
            String repliesBlock = rawResponse.substring(startIndex + startTag.length(), endIndex).trim();
            
            List<String> replies = java.util.Arrays.stream(repliesBlock.split("\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
                    
            if (!replies.isEmpty()) {
                return new ParsedAiResponse(cleanText, replies);
            }
        }
        
        // Strip out broken tags if they exist but are malformed
        String cleanedText = rawResponse.replace(startTag, "").replace(endTag, "").trim();
        return new ParsedAiResponse(cleanedText, null);
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getAllConversations() {
        return conversationRepository.findAllByOrderByCreatedAtDesc().stream().map(c -> {
            long branchCount = nodeRepository.countLeafNodesByConversationId(c.getId());
            return ConversationDto.builder()
                    .id(c.getId())
                    .title(c.getTitle())
                    .createdAt(c.getCreatedAt())
                    .branchCount(branchCount)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public ChatResponse handleMessage(ChatRequest request) {
        Long conversationId = request.getConversationId();
        String userMessage = request.getMessage().trim();
        Conversation conversation;

        final Long reqConversationId = conversationId;
        // 1. Create or fetch conversation
        if (reqConversationId == null) {
            String title = userMessage.length() > 40 ? userMessage.substring(0, 37) + "..." : userMessage;
            conversation = conversationRepository.save(Conversation.builder().title(title).build());
            conversationId = conversation.getId();
        } else {
            conversation = conversationRepository.findById(reqConversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + reqConversationId));
        }

        // 2. Load flow state and existing nodes
        FlowState flowState = flowStateManager.getOrCreateState(conversationId);
        List<Node> allNodes = nodeRepository.findByConversationId(conversationId);

        // 3. Handle First Message / Root Node
        if (allNodes.isEmpty()) {
            // First message always creates a ROOT node
            String prompt = contextBuilderService.buildLlmPrompt(List.of(), userMessage);
            String aiAnswerRaw = llmService.generate(prompt, request.getModel());
            ParsedAiResponse parsed = parseAiResponse(aiAnswerRaw);

            Node rootNode = branchEngine.createBranch(conversationId, null, userMessage, parsed.cleanAnswer(), NodeType.ROOT);
            rootNode.setQuickReplies(parsed.quickReplies());
            rootNode = nodeRepository.save(rootNode);

            flowState.setCurrentNodeId(rootNode.getId());
            flowState.setCurrentPath(String.valueOf(rootNode.getId()));
            flowState.setLastVisitedNodeId(rootNode.getId());
            flowState = flowStateManager.saveState(flowState);

            final Long finalConvId = conversationId;
            final String finalAiAnswer = parsed.cleanAnswer();
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    String generatedTitle = llmService.generateConversationTitle(userMessage, finalAiAnswer);
                    if (generatedTitle != null && !generatedTitle.isBlank()) {
                        conversationRepository.findById(finalConvId).ifPresent(conv -> {
                            conv.setTitle(generatedTitle);
                            conversationRepository.save(conv);
                        });
                    }
                } catch (Exception e) {
                    // Fail silently, keep the original truncated title
                }
            });

            return ChatResponse.builder()
                    .conversationId(conversationId)
                    .node(rootNode)
                    .flowState(flowState)
                    .isAmbiguous(false)
                    .quickReplies(parsed.quickReplies())
                    .build();
        }

        final Long targetCurrentNodeId = flowState.getCurrentNodeId();
        // Fetch current active node
        Node currentNode = allNodes.stream()
                .filter(n -> n.getId().equals(targetCurrentNodeId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Current node not found in workspace"));

        // 4. Resolve Context Nodes for checking intent / ambiguity
        List<Node> activeContextNodes = pathEngine.calculateCurrentPath(currentNode, allNodes);
        String activePathStr = contextBuilderService.buildPathContextString(activeContextNodes);

        // 5. Check Ambiguity (e.g. user says "continue" but has active sub-paths)
        if (ambiguityResolver.isContinuationAmbiguous(userMessage, flowState, allNodes)) {
            return ChatResponse.builder()
                    .conversationId(conversationId)
                    .isAmbiguous(true)
                    .ambiguityQuestion(ambiguityResolver.getAmbiguityQuestion())
                    .ambiguityOptions(ambiguityResolver.getAmbiguityOptions(flowState, allNodes))
                    .flowState(flowState)
                    .build();
        }

        // 6. Classify user message intent
        Intent intent = intentClassifier.classifyIntent(userMessage, activePathStr);

        // 7. Process based on intent
        if (intent == Intent.RETURN_PARENT) {
            flowState = flowNavigator.navigateToParent(flowState, allNodes);
            flowState = flowStateManager.saveState(flowState);
            
            // Generate a notification response node explaining the path shift
            Node targetNode = nodeRepository.findById(flowState.getCurrentNodeId()).orElseThrow();
            Node responseNode = Node.builder()
                    .id(-1L) // Virtual Node indicating return action
                    .conversationId(conversationId)
                    .parentId(targetNode.getId())
                    .question("System Navigation")
                    .answer("Navigated back to parent topic: \"" + targetNode.getQuestion() + "\".")
                    .nodeType(NodeType.CONTINUATION)
                    .depth(targetNode.getDepth())
                    .path(targetNode.getPath())
                    .build();

            return ChatResponse.builder()
                    .conversationId(conversationId)
                    .node(responseNode)
                    .flowState(flowState)
                    .isAmbiguous(false)
                    .build();

        } else if (intent == Intent.RETURN_ROOT) {
            flowState = flowNavigator.navigateToRoot(flowState, allNodes);
            flowState = flowStateManager.saveState(flowState);

            Node targetNode = nodeRepository.findById(flowState.getCurrentNodeId()).orElseThrow();
            Node responseNode = Node.builder()
                    .id(-1L)
                    .conversationId(conversationId)
                    .parentId(targetNode.getId())
                    .question("System Navigation")
                    .answer("Navigated back to Root topic: \"" + targetNode.getQuestion() + "\".")
                    .nodeType(NodeType.ROOT)
                    .depth(targetNode.getDepth())
                    .path(targetNode.getPath())
                    .build();

            return ChatResponse.builder()
                    .conversationId(conversationId)
                    .node(responseNode)
                    .flowState(flowState)
                    .isAmbiguous(false)
                    .build();

        } else if (intent == Intent.NEW_TOPIC) {
            // Treat as starting a new conversation or a disconnected root node (for this MVP, let's start a brand new tree)
            String prompt = contextBuilderService.buildLlmPrompt(List.of(), userMessage);
            String aiAnswerRaw = llmService.generate(prompt, request.getModel());
            ParsedAiResponse parsed = parseAiResponse(aiAnswerRaw);

            Node newRootNode = branchEngine.createBranch(conversationId, null, userMessage, parsed.cleanAnswer(), NodeType.ROOT);
            newRootNode.setQuickReplies(parsed.quickReplies());
            newRootNode = nodeRepository.save(newRootNode);

            flowState.setLastVisitedNodeId(flowState.getCurrentNodeId());
            flowState.setCurrentNodeId(newRootNode.getId());
            flowState.setCurrentPath(String.valueOf(newRootNode.getId()));
            flowState = flowStateManager.saveState(flowState);

            return ChatResponse.builder()
                    .conversationId(conversationId)
                    .node(newRootNode)
                    .flowState(flowState)
                    .isAmbiguous(false)
                    .quickReplies(parsed.quickReplies())
                    .build();
        }

        // 8. Default: CONTINUE_CURRENT or CLARIFICATION
        // Detect branching structure: continuation vs sub-branch (clarification) vs sibling topic
        BranchType branchType = branchDetector.detectBranchType(currentNode, userMessage);
        
        NodeType newNodeType;
        Node parentNodeForNewNode;

        if (branchType == BranchType.SIBLING_TOPIC && currentNode.getParentId() != null) {
            // Branch off current node's parent (creates a sibling node)
            parentNodeForNewNode = nodeRepository.findById(currentNode.getParentId())
                    .orElse(currentNode);
            newNodeType = NodeType.CLARIFICATION;
        } else if (branchType == BranchType.NEW_BRANCH) {
            // Branch off current node (creates a child node, level down)
            parentNodeForNewNode = currentNode;
            newNodeType = NodeType.CLARIFICATION;
        } else {
            // Continuation of current path (conceptually a child node but labeled CONTINUATION)
            parentNodeForNewNode = currentNode;
            newNodeType = NodeType.CONTINUATION;
        }

        // Build the active context up to the parent node to formulate the response
        List<Node> generationContextNodes = pathEngine.calculateCurrentPath(parentNodeForNewNode, allNodes);
        String generationPrompt = contextBuilderService.buildLlmPrompt(generationContextNodes, userMessage);
        String aiAnswerRaw = llmService.generate(generationPrompt, request.getModel());
        ParsedAiResponse parsed = parseAiResponse(aiAnswerRaw);

        // Save new node
        Node savedNode = branchEngine.createBranch(
                conversationId,
                parentNodeForNewNode,
                userMessage,
                parsed.cleanAnswer(),
                newNodeType
        );
        savedNode.setQuickReplies(parsed.quickReplies());
        savedNode = nodeRepository.save(savedNode);

        // Update active flow state
        List<Node> newPathNodes = pathEngine.calculateCurrentPath(savedNode, allNodes);
        newPathNodes.add(savedNode); // Add newly created node
        String newPathStr = newPathNodes.stream()
                .map(n -> String.valueOf(n.getId()))
                .filter(id -> !id.equals("null") && !id.equals("-1"))
                .distinct()
                .collect(Collectors.joining(","));

        flowState.setLastVisitedNodeId(currentNode.getId());
        flowState.setCurrentNodeId(savedNode.getId());
        flowState.setCurrentPath(newPathStr);
        flowState = flowStateManager.saveState(flowState);

        return ChatResponse.builder()
                .conversationId(conversationId)
                .node(savedNode)
                .flowState(flowState)
                .isAmbiguous(false)
                .quickReplies(parsed.quickReplies())
                .build();
    }

    @Transactional
    public void deleteConversation(Long conversationId) {
        flowStateManager.deleteState(conversationId);
        nodeRepository.deleteByConversationId(conversationId);
        conversationRepository.deleteById(conversationId);
    }

    @Transactional
    public void renameConversation(Long conversationId, String newTitle) {
        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        
        String trimmedTitle = newTitle.trim();
        if (trimmedTitle.length() > 100) {
            trimmedTitle = trimmedTitle.substring(0, 100);
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));
        
        conversation.setTitle(trimmedTitle);
        conversationRepository.save(conversation);
    }
}
