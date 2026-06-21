package com.tinexus.tinexusflow.controller;

import com.tinexus.tinexusflow.dto.GeminiModelDto;
import com.tinexus.tinexusflow.service.LLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/models")
@RequiredArgsConstructor
public class ModelController {

    private final LLMService llmService;

    @GetMapping
    public ResponseEntity<List<GeminiModelDto>> getModels() {
        return ResponseEntity.ok(llmService.getAvailableChatModels());
    }
}
