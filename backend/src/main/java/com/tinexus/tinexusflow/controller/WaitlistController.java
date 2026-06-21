package com.tinexus.tinexusflow.controller;

import com.tinexus.tinexusflow.dto.WaitlistRequest;
import com.tinexus.tinexusflow.entity.WaitlistEntry;
import com.tinexus.tinexusflow.repository.WaitlistEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin(origins = "*") // In production, this should be restricted
public class WaitlistController {

    @Autowired
    private WaitlistEntryRepository waitlistRepository;

    @PostMapping
    public ResponseEntity<?> joinWaitlist(@RequestBody WaitlistRequest request) {
        String email = request.getEmail();
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        // Basic email validation
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
        }

        if (waitlistRepository.existsByEmail(email)) {
            // Already on the waitlist, but we return a success-like message to not error out the frontend aggressively
            return ResponseEntity.ok(Map.of("message", "You are already on the waitlist!"));
        }

        WaitlistEntry entry = new WaitlistEntry(email);
        waitlistRepository.save(entry);

        return ResponseEntity.ok(Map.of("message", "Successfully joined the waitlist"));
    }
}
