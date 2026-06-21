package com.tinexus.tinexusflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    private Long conversationId;

    @NotBlank(message = "Message content cannot be blank")
    private String message;

    private String model;
}
