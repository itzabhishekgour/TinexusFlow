package com.tinexus.tinexusflow.engine.intelligence;

import com.tinexus.tinexusflow.entity.Node;
import com.tinexus.tinexusflow.service.LLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@RequiredArgsConstructor
public class BranchDetector {

    private final LLMService llmService;

    public enum BranchType {
        NEW_BRANCH,
        CONTINUATION,
        SIBLING_TOPIC
    }

    public BranchType detectBranchType(Node currentNode, String message) {
        if (currentNode == null) {
            return BranchType.CONTINUATION; // First node is always a continuation of the root context
        }

        try {
            String promptTemplate = loadBranchPromptTemplate();
            String prompt = promptTemplate
                    .replace("{{currentQuestion}}", currentNode.getQuestion())
                    .replace("{{currentAnswer}}", currentNode.getAnswer())
                    .replace("{{message}}", message);

            String result = llmService.generate(prompt).trim().toUpperCase();

            if (result.contains("SIBLING_TOPIC")) {
                return BranchType.SIBLING_TOPIC;
            } else if (result.contains("NEW_BRANCH")) {
                return BranchType.NEW_BRANCH;
            } else {
                return BranchType.CONTINUATION;
            }
        } catch (Exception e) {
            System.err.println("Failed to detect branch type via LLM, falling back to NEW_BRANCH: " + e.getMessage());
            return BranchType.NEW_BRANCH;
        }
    }

    private String loadBranchPromptTemplate() {
        try {
            Path path = Paths.get("backend/src/main/resources/prompts/branch-detection.txt");
            if (!Files.exists(path)) {
                path = Paths.get("src/main/resources/prompts/branch-detection.txt");
            }
            if (!Files.exists(path)) {
                return "Current: {{currentQuestion}} -> {{currentAnswer}}. New: {{message}}. Respond with NEW_BRANCH, CONTINUATION, or SIBLING_TOPIC.";
            }
            return Files.readString(path);
        } catch (IOException e) {
            return "Current: {{currentQuestion}} -> {{currentAnswer}}. New: {{message}}. Respond with NEW_BRANCH, CONTINUATION, or SIBLING_TOPIC.";
        }
    }
}
