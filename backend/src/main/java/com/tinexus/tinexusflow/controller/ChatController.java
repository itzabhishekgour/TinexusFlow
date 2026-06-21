package com.tinexus.tinexusflow.controller;

import com.tinexus.tinexusflow.dto.ChatRequest;
import com.tinexus.tinexusflow.dto.ChatResponse;
import com.tinexus.tinexusflow.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.tinexus.tinexusflow.dto.RenameRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<com.tinexus.tinexusflow.dto.ChatResponse> handleMessage(@Valid @RequestBody com.tinexus.tinexusflow.dto.ChatRequest request) {
        return ResponseEntity.ok(chatService.handleMessage(request));
    }

    @GetMapping("/conversations")
    public ResponseEntity<java.util.List<com.tinexus.tinexusflow.dto.ConversationDto>> getConversations() {
        return ResponseEntity.ok(chatService.getAllConversations());
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        chatService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/conversations/{id}")
    public ResponseEntity<Void> renameConversation(@PathVariable Long id, @RequestBody RenameRequest request) {
        chatService.renameConversation(id, request.getTitle());
        return ResponseEntity.ok().build();
    }
}
