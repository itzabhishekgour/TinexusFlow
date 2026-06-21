package com.tinexus.tinexusflow.engine.intelligence;

import com.tinexus.tinexusflow.service.LLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@RequiredArgsConstructor
public class IntentClassifier {

    private final LLMService llmService;

    public enum Intent {
        NEW_TOPIC,
        CLARIFICATION,
        CONTINUE_CURRENT,
        RETURN_PARENT,
        RETURN_ROOT
    }

    public Intent classifyIntent(String message, String activePathContext) {
        String cleanMessage = message.trim().toLowerCase();

        // 1. Simple heuristic overrides for ultra-responsive navigation
        if (cleanMessage.matches("^(go back|back|return to parent|parent|return parent|previous)$")) {
            return Intent.RETURN_PARENT;
        }
        if (cleanMessage.matches("^(go to root|reset|return to root|root|restart|start over|home)$")) {
            return Intent.RETURN_ROOT;
        }
        if (cleanMessage.matches("^(new topic|new chat|start new topic)$")) {
            return Intent.NEW_TOPIC;
        }

        // 2. LLM Intent Classification
        try {
            String promptTemplate = loadIntentPromptTemplate();
            String prompt = promptTemplate
                    .replace("{{context}}", activePathContext)
                    .replace("{{message}}", message);

            String result = llmService.generate(prompt).trim().toUpperCase();

            // Sanitize response
            if (result.contains("RETURN_PARENT")) return Intent.RETURN_PARENT;
            if (result.contains("RETURN_ROOT")) return Intent.RETURN_ROOT;
            if (result.contains("NEW_TOPIC")) return Intent.NEW_TOPIC;
            if (result.contains("CLARIFICATION")) return Intent.CLARIFICATION;
            return Intent.CONTINUE_CURRENT;

        } catch (Exception e) {
            // Log error and fallback
            System.err.println("Failed to classify intent using LLM, falling back to CONTINUE_CURRENT: " + e.getMessage());
            return Intent.CONTINUE_CURRENT;
        }
    }

    private String loadIntentPromptTemplate() {
        try {
            // Find absolute path in resources
            Path path = Paths.get("backend/src/main/resources/prompts/intent-classification.txt");
            if (!Files.exists(path)) {
                path = Paths.get("src/main/resources/prompts/intent-classification.txt");
            }
            if (!Files.exists(path)) {
                // Return default template if file load fails
                return "Classify this message: {{message}} context: {{context}}";
            }
            return Files.readString(path);
        } catch (IOException e) {
            return "Classify this message: {{message}} context: {{context}}";
        }
    }
}
