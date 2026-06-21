package com.tinexus.tinexusflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tinexus.tinexusflow.dto.GeminiModelDto;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.output.Response;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LLMService {

    private static final Logger log = LoggerFactory.getLogger(LLMService.class);
    
    private final String apiKey;
    private final String defaultModel;
    private final Map<String, ChatLanguageModel> modelCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    // The cached list of models available to the frontend.
    private List<GeminiModelDto> cachedModels = new ArrayList<>();

    // Absolute fallback list in case API fetch fails or before it completes.
    private final List<GeminiModelDto> FALLBACK_MODELS = List.of(
            GeminiModelDto.builder().id("gemini-2.5-flash").label("Gemini 2.5 Flash").description("Fallback default model").build()
    );

    public LLMService(
            @Value("${tinexusflow.gemini.api-key:}") String apiKey,
            @Value("${tinexusflow.gemini.model-name:gemini-3.1-flash-lite}") String defaultModel) {
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        
        // Initialize cache with fallback to prevent NPEs before PostConstruct completes
        this.cachedModels = new ArrayList<>(FALLBACK_MODELS);
    }

    @PostConstruct
    public void init() {
        fetchAvailableModels();
    }

    public synchronized void fetchAvailableModels() {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_GEMINI_API_KEY") || apiKey.contains("placeholder")) {
            log.warn("Mock mode active. Using fallback model list.");
            return;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
            String responseBody = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode modelsNode = rootNode.get("models");

            List<GeminiModelDto> fetchedModels = new ArrayList<>();
            
            if (modelsNode != null && modelsNode.isArray()) {
                for (JsonNode modelNode : modelsNode) {
                    JsonNode methodsNode = modelNode.get("supportedGenerationMethods");
                    boolean isChatModel = false;
                    
                    if (methodsNode != null && methodsNode.isArray()) {
                        for (JsonNode method : methodsNode) {
                            if ("generateContent".equals(method.asText())) {
                                isChatModel = true;
                                break;
                            }
                        }
                    }

                    if (isChatModel) {
                        String rawName = modelNode.has("name") ? modelNode.get("name").asText() : "";
                        String displayName = modelNode.has("displayName") ? modelNode.get("displayName").asText() : rawName;
                        String description = modelNode.has("description") ? modelNode.get("description").asText() : "";

                        // Strip "models/" prefix since LangChain4j builder expects it without the prefix
                        String id = rawName.startsWith("models/") ? rawName.substring(7) : rawName;
                        
                        if (!id.isEmpty()) {
                            fetchedModels.add(GeminiModelDto.builder()
                                    .id(id)
                                    .label(displayName)
                                    .description(description)
                                    .build());
                        }
                    }
                }
            }

            if (!fetchedModels.isEmpty()) {
                this.cachedModels = fetchedModels;
                log.info("Successfully fetched and cached {} valid chat models from Gemini API.", fetchedModels.size());
            } else {
                log.warn("Fetched models list was empty. Keeping fallback models.");
            }

        } catch (Exception e) {
            log.error("Failed to fetch models from Gemini API. Using safe fallback list.", e);
        }
    }

    public List<GeminiModelDto> getAvailableChatModels() {
        return cachedModels;
    }

    private ChatLanguageModel getModel(String modelName) {
        // Fallback to Mock if API key is invalid
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_GEMINI_API_KEY") || apiKey.contains("placeholder")) {
            return new MockChatLanguageModel();
        }

        // Return cached or build new
        return modelCache.computeIfAbsent(modelName, name -> {
            log.info("Initializing LangChain4j Gemini Model: {}", name);
            return GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(name)
                    .temperature(0.7)
                    .build();
        });
    }

    public String generate(String prompt) {
        return generate(prompt, defaultModel);
    }

    public String generate(String prompt, String requestedModel) {
        // Validate Model against cached list
        String modelToUse = requestedModel;
        boolean isValid = false;
        
        if (modelToUse != null && !modelToUse.trim().isEmpty()) {
            for (GeminiModelDto cached : cachedModels) {
                if (cached.getId().equals(modelToUse)) {
                    isValid = true;
                    break;
                }
            }
        }
        
        if (!isValid) {
            log.warn("Invalid or missing model requested ('{}'). Falling back to default: {}", requestedModel, defaultModel);
            modelToUse = defaultModel;
            // Last resort if defaultModel isn't even in the cached list
            boolean defaultIsValid = false;
            for (GeminiModelDto cached : cachedModels) {
                if (cached.getId().equals(modelToUse)) {
                    defaultIsValid = true;
                    break;
                }
            }
            if (!defaultIsValid && !cachedModels.isEmpty()) {
                modelToUse = cachedModels.get(0).getId();
            }
        }

        log.info("[GEMINI_API_CALL] Timestamp: {}, Sending prompt to LLM (model: {}, length: {})", 
                 System.currentTimeMillis(), modelToUse, prompt.length());
                 
        try {
            ChatLanguageModel chatLanguageModel = getModel(modelToUse);
            
            String systemInstruction = "You are TinexusFlow's AI assistant, designed for deep, structured, branching conversations.\n" +
                    "\n" +
                    "Formatting guidelines:\n" +
                    "- Use Markdown formatting in your responses: headings (##), bold (**text**), bullet points, and numbered lists where appropriate\n" +
                    "- When explaining multi-part concepts, use clear headings or numbered steps to organize the response\n" +
                    "- When comparing options or listing items, use bullet points instead of run-on sentences\n" +
                    "- Use bold text to highlight key terms or important values the user should notice\n" +
                    "- Keep paragraphs reasonably short and scannable — avoid large unbroken blocks of text\n" +
                    "- Match the formatting density to the content: a simple one-line answer doesn't need headings, but a multi-concept explanation should be broken into clear sections\n" +
                    "- When the conversation is in Hindi/Hinglish (mixed Hindi-English), maintain the same formatting structure (headings, bullets) while responding in the language the user used\n" +
                    "\n" +
                    "Branching context awareness:\n" +
                    "- You are aware this conversation may include branches (sub-explorations) and a \"return to parent\" navigation pattern. When the context indicates the user has returned from a branch, briefly acknowledge continuity naturally rather than restarting the explanation from scratch.\n" +
                    "\n" +
                    "Quick-reply options:\n" +
                    "When asking a clarifying question, OR when suggesting multiple possible directions the user could take next, you may optionally offer 2-4 short tappable options instead of requiring the user to type a full response.\n" +
                    "To do this, end your response with a block in this exact format:\n" +
                    "\n" +
                    "[QUICK_REPLIES]\n" +
                    "Option label one\n" +
                    "Option label two\n" +
                    "Option label three\n" +
                    "[/QUICK_REPLIES]\n" +
                    "\n" +
                    "Rules:\n" +
                    "- Only include this block when it genuinely helps (a clear choice exists) — most responses should NOT have this block\n" +
                    "- Each option should be short (2-6 words), like a button label, not a full sentence\n" +
                    "- Maximum 4 options\n" +
                    "- Do not use this for simple yes/no answers to factual questions — only for genuine branching choices or clarifying questions\n" +
                    "- Never make the user feel forced — your main response text should still make sense and be answerable by free-text reply even if they ignore the buttons";

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(dev.langchain4j.data.message.SystemMessage.from(systemInstruction));
            messages.add(dev.langchain4j.data.message.UserMessage.from(prompt));

            Response<AiMessage> response = chatLanguageModel.generate(messages);
            String responseText = response.content().text();
            
            log.info("Received response from LLM (length: {})", responseText != null ? responseText.length() : 0);
            return responseText;
        } catch (Exception e) {
            log.error("Error generating LLM response using model {}", modelToUse, e);
            
            String errorMessage = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            
            // Check for Rate Limit Exception (429 or RESOURCE_EXHAUSTED)
            if (errorMessage.contains("429") || errorMessage.contains("resource_exhausted") || errorMessage.contains("quota")) {
                // Return a specific rate-limit message flag so the frontend can catch it, or just return the friendly message directly.
                // Since ChatService just takes this string and saves it as a node, we return the friendly message with a prefix.
                return "RATE_LIMIT_ERROR: This model (" + modelToUse + ") has hit its rate limit for now. Try switching to a different model below, or wait a moment.";
            }
            
            String warningPrefix = "⚠️ [AI Studio Connection Failed: " + e.getMessage() + ". Using local engine fallback.]\n\n";
            
            String cleanPrompt = prompt.toLowerCase();
            String reply;
            if (cleanPrompt.contains("what is ai")) {
                reply = "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions.";
            } else if (cleanPrompt.contains("what are llm") || cleanPrompt.contains("what is llm")) {
                reply = "Large Language Models (LLMs) are a type of artificial intelligence program that can recognize and generate text.";
            } else if (cleanPrompt.contains("context window")) {
                reply = "A context window refers to the maximum amount of text (tokens) that an LLM can read and consider at one time.";
            } else if (cleanPrompt.contains("continue")) {
                reply = "Certainly! Let's continue exploring our active conversation thread. What specific detail should we focus on next?";
            } else {
                reply = "TinexusFlow local engine response. The active conversation context path was successfully resolved.";
            }
            
            return warningPrefix + reply;
        }
    }

    public String generateConversationTitle(String userMessage, String aiResponse) {
        String systemInstruction = "Generate a short, descriptive title for this conversation based on the exchange below.\n" +
                "\n" +
                "Rules:\n" +
                "- Maximum 5-6 words\n" +
                "- No quotation marks, no trailing punctuation\n" +
                "- Capture the core topic, not the exact question phrasing\n" +
                "- Do not start with \"How to\" or \"What is\" even if the original question did — extract the underlying topic instead\n" +
                "- Output ONLY the title text, nothing else (no explanation, no preamble)";

        String truncatedAiResponse = aiResponse;
        if (aiResponse != null && aiResponse.length() > 200) {
            truncatedAiResponse = aiResponse.substring(0, 200);
        }

        String prompt = "User question: " + userMessage + "\n" +
                "AI response summary: " + truncatedAiResponse;

        try {
            // Force the lightweight model
            ChatLanguageModel chatLanguageModel = getModel("gemini-3.1-flash-lite");
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(dev.langchain4j.data.message.SystemMessage.from(systemInstruction));
            messages.add(dev.langchain4j.data.message.UserMessage.from(prompt));

            Response<AiMessage> response = chatLanguageModel.generate(messages);
            String title = response.content().text().trim().replaceAll("^[\"']|[\"']$", "");
            log.info("Generated conversation title: {}", title);
            return title;
        } catch (Exception e) {
            log.warn("Failed to generate conversation title (fallback will be used)", e);
            return null; // Return null on failure so caller can ignore it
        }
    }

    /**
     * A lightweight mock LLM model that returns simulated intelligent answers
     * so that the application runs locally even without active AI API keys.
     */
    private static class MockChatLanguageModel implements ChatLanguageModel {
        @Override
        public Response<AiMessage> generate(List<ChatMessage> messages) {
            String lastUserMessage = "";
            if (!messages.isEmpty()) {
                lastUserMessage = messages.getLast().text();
            }

            String reply;
            if (lastUserMessage.toLowerCase().contains("what is ai")) {
                reply = "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions.";
            } else if (lastUserMessage.toLowerCase().contains("what are llm") || lastUserMessage.toLowerCase().contains("what is llm")) {
                reply = "Large Language Models (LLMs) are a type of artificial intelligence program that can recognize and generate text.";
            } else if (lastUserMessage.toLowerCase().contains("context window")) {
                reply = "A context window refers to the maximum amount of text (tokens) that an LLM can read and consider at one time.";
            } else if (lastUserMessage.toLowerCase().contains("continue")) {
                reply = "Certainly! Let's continue exploring our active conversation thread.";
            } else {
                reply = "This is a simulated response from the TinexusFlow local engine. To enable real AI responses, please configure a valid GEMINI_API_KEY.";
            }

            return Response.from(AiMessage.from(reply));
        }
    }
}
