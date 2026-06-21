package com.tinexus.tinexusflow.service;

import com.tinexus.tinexusflow.entity.Node;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContextBuilderService {

    public String buildPathContextString(List<Node> activePathNodes) {
        if (activePathNodes == null || activePathNodes.isEmpty()) {
            return "No previous context. This is the start of the conversation.";
        }

        StringBuilder contextBuilder = new StringBuilder();
        for (int i = 0; i < activePathNodes.size(); i++) {
            Node node = activePathNodes.get(i);
            String prefix = "";
            if (node.getParentId() == null) {
                prefix = "[ROOT] ";
            } else {
                prefix = String.format("[Branch level %d, %s] ", node.getDepth(), node.getNodeType());
            }

            contextBuilder.append(prefix)
                    .append("Q: ").append(node.getQuestion()).append("\n")
                    .append("A: ").append(node.getAnswer()).append("\n\n");
        }

        return contextBuilder.toString().trim();
    }

    public String buildLlmPrompt(List<Node> activePathNodes, String userMessage) {
        String pathContextStr = buildPathContextString(activePathNodes);
        
        try {
            String template = loadContextBuilderTemplate();
            return template
                    .replace("{{pathContext}}", pathContextStr)
                    .replace("{{message}}", userMessage);
        } catch (Exception e) {
            return "Context:\n" + pathContextStr + "\n\nUser Query: " + userMessage;
        }
    }

    private String loadContextBuilderTemplate() {
        try {
            Path path = Paths.get("backend/src/main/resources/prompts/context-builder.txt");
            if (!Files.exists(path)) {
                path = Paths.get("src/main/resources/prompts/context-builder.txt");
            }
            if (!Files.exists(path)) {
                return "Active Context:\n{{pathContext}}\n\nUser: {{message}}\nResponse:";
            }
            return Files.readString(path);
        } catch (IOException e) {
            return "Active Context:\n{{pathContext}}\n\nUser: {{message}}\nResponse:";
        }
    }
}
