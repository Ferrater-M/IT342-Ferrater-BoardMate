package edu.cit.ferrater.boardinghouse.features.auth;

import java.security.Principal;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.ferrater.boardinghouse.exception.UserNotFoundException;
import lombok.Data;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        User user = userService.findByEmail(loginRequest.getEmail());

        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "user", Map.of(
                                "id", user.getId(),
                                "email", user.getEmail(),
                                "firstName", user.getFirstName(),
                                "lastName", user.getLastName(),
                                "role", user.getRole(),
                                "profilePicture", user.getProfilePicture()
                        )
                )
        );
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest registerRequest) {

        try {

            userService.registerUser(
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getRole() != null ? registerRequest.getRole() : "ROLE_USER",
                    registerRequest.getFirstName(),
                    registerRequest.getLastName()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Registration successful! Please check your email to verify your account."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestParam("token") String token
    ) {
        userService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<Map<String, String>> updateProfilePicture(
            @RequestBody Map<String, String> request,
            Principal principal
    ) {
        String imageUrl = request.get("imageUrl");
        userService.updateProfilePicture(principal.getName(), imageUrl);
        return ResponseEntity.ok(Map.of("message", "Profile picture updated"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @RequestBody Map<String, String> request
    ) {
        try {
            userService.resendVerificationEmail(request.get("email"));
            return ResponseEntity.ok(Map.of("message", "Verification email resent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upgrade-to-admin")
    public ResponseEntity<Map<String, String>> upgradeToAdmin(
            @RequestBody Map<String, String> request
    ) {
        try {
            userService.upgradeToAdmin(request.get("email"));
            return ResponseEntity.ok(Map.of("message", "User upgraded to admin"));
        } catch (UserNotFoundException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/debug/verify-email")
    public ResponseEntity<Map<String, String>> debugVerifyEmail(
            @RequestBody Map<String, String> request
    ) {
        try {
            userService.manuallyVerifyEmail(request.get("email"));
            return ResponseEntity.ok(Map.of("message", "Email verified (debug mode)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

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

    private static final Map<String, Map<String, String>> pendingApplications = new HashMap<>();

    @PostMapping("/applications/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, String> application, Principal principal) {
        String email = principal != null ? principal.getName() : application.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));

        application.put("email", email);
        application.put("status", "PENDING");
        pendingApplications.put(email, application);
        return ResponseEntity.ok(Map.of("message", "Application submitted"));
    }

    @GetMapping("/applications/pending")
    public ResponseEntity<?> getPendingApplications() {
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

    @PostMapping("/applications/approve")
    public ResponseEntity<?> approveApplication(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            userService.upgradeToAdmin(email);

            if (pendingApplications.containsKey(email)) {
                pendingApplications.get(email).put("status", "APPROVED");
            }

            return ResponseEntity.ok(Map.of("message", "Application approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/applications/reject")
    public ResponseEntity<?> rejectApplication(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (pendingApplications.containsKey(email)) {
            pendingApplications.get(email).put("status", "REJECTED");
            return ResponseEntity.ok(Map.of("message", "Application rejected"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Application not found"));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications() {
        return ResponseEntity.ok(pendingApplications.values().stream()
                .filter(app -> "PENDING".equals(app.get("status")))
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
}
