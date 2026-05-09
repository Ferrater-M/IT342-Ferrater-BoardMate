package edu.cit.ferrater.boardinghouse.features.auth;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Data;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/debug/users")
    public ResponseEntity<?> debugUsers() {
        return ResponseEntity.ok(userService.findAll().stream()
                .map(u -> Map.of("email", u.getEmail(), "role", u.getRole()))
                .toList());
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = userService.authenticate(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
            );
            
            User user = userService.findByEmail(loginRequest.getEmail());

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("name", user.getFirstName() + " " + user.getLastName());
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("profilePicture", user.getProfilePicture());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgrade(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            userService.upgradeToAdmin(email);
            
            // Update status in pending list if exists
            if (pendingApplications.containsKey(email)) {
                pendingApplications.get(email).put("status", "APPROVED");
            }
            
            return ResponseEntity.ok(Map.of("message", "Role updated to ROLE_ADMIN"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reject")
    public ResponseEntity<?> reject(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (pendingApplications.containsKey(email)) {
            pendingApplications.get(email).put("status", "REJECTED");
            return ResponseEntity.ok(Map.of("message", "Application rejected"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Application not found"));
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@RequestBody Map<String, String> payload, Principal principal) {
        try {
            String imageUrl = payload.get("profilePicture");
            User user = userService.updateProfilePicture(principal.getName(), imageUrl);
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Profile picture updated");
            response.put("profilePicture", user.getProfilePicture());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {

            userService.registerUser(
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getRole() != null ? registerRequest.getRole() : "ROLE_USER",
                    registerRequest.getFirstName(),
                    registerRequest.getLastName()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    private static final java.util.Map<String, Map<String, String>> pendingApplications = new java.util.HashMap<>();

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, String> application) {
        String email = application.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        
        application.put("status", "PENDING");
        pendingApplications.put(email, application);
        return ResponseEntity.ok(Map.of("message", "Application submitted"));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications() {
        return ResponseEntity.ok(pendingApplications.values().stream()
                .filter(app -> "PENDING".equals(app.get("status")))
                .toList());
    }

    @GetMapping("/applications/history")
    public ResponseEntity<?> getHistory() {
        return ResponseEntity.ok(pendingApplications.values().stream()
                .filter(app -> !"PENDING".equals(app.get("status")))
                .toList());
    }

    @GetMapping("/application-status")
    public ResponseEntity<?> getStatus(Principal principal) {
        Map<String, String> app = pendingApplications.get(principal.getName());
        if (app != null) {
            return ResponseEntity.ok(Map.of("status", app.get("status")));
        }
        return ResponseEntity.ok(Map.of("status", "NONE"));
    }

    // ==================== Request DTOs ====================
    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    static class RegisterRequest {
        private String email;
        private String password;
        private String role;
        private String firstName;
        private String lastName;
    }
}
