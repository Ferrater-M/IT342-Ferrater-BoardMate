package edu.cit.ferrater.boardinghouse.features.auth;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.ferrater.boardinghouse.config.EmailService;
import edu.cit.ferrater.boardinghouse.exception.EmailAlreadyVerifiedException;
import edu.cit.ferrater.boardinghouse.exception.InvalidCredentialsException;
import edu.cit.ferrater.boardinghouse.exception.UserAlreadyExistsException;
import edu.cit.ferrater.boardinghouse.exception.UserNotFoundException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class UserService {

    private static final String DEFAULT_ROLE = "ROLE_USER";
    private static final String ADMIN_ROLE   = "ROLE_ADMIN";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final java.util.Map<String, User> unverifiedUsers = new java.util.HashMap<>();

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public UserService(UserRepository userRepository,
                       EmailService emailService,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.emailService    = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(normalize(email)).orElse(null);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public String authenticate(String email, String password) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        return generateJwtToken(user);
    }

    private String generateJwtToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public User registerUser(String email, String password,
                             String role, String firstName, String lastName) {
        String normalizedEmail = normalize(email);

        if (userRepository.findByEmail(normalizedEmail).isPresent() || unverifiedUsers.containsKey(normalizedEmail)) {
            throw new UserAlreadyExistsException("Email already in use");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .role(role != null ? role : DEFAULT_ROLE)
                .firstName(firstName)
                .lastName(lastName)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .build();

        unverifiedUsers.put(normalizedEmail, user);

        try {
            emailService.sendVerificationEmail(normalizedEmail, verificationToken);
        } catch (Exception e) {
            System.err.println("Warning: Could not send verification email: " + e.getMessage());
        }

        return user;
    }

    public void verifyEmail(String token) {
        User user = unverifiedUsers.values().stream()
                .filter(u -> token.equals(u.getVerificationToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);

        userRepository.save(user);
        unverifiedUsers.remove(user.getEmail());
    }

    public void resendVerificationEmail(String email) {
        String normalizedEmail = normalize(email);
        User user = unverifiedUsers.get(normalizedEmail);
        
        if (user == null) {
            user = userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
        }

        if (user.isEmailVerified()) {
            throw new EmailAlreadyVerifiedException("Email is already verified");
        }

        String newToken = UUID.randomUUID().toString();
        user.setVerificationToken(newToken);
        
        if (unverifiedUsers.containsKey(normalizedEmail)) {
            unverifiedUsers.put(normalizedEmail, user);
        } else {
            userRepository.save(user);
        }
        
        emailService.sendVerificationEmail(user.getEmail(), newToken);
    }

    public void upgradeToAdmin(String email) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setRole(ADMIN_ROLE);
        userRepository.save(user);
    }

    public User updateProfilePicture(String email, String imageUrl) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setProfilePicture(imageUrl);
        return userRepository.save(user);
    }

    public User manuallyVerifyEmail(String email) {
        String normalizedEmail = normalize(email);
        User user = unverifiedUsers.get(normalizedEmail);
        
        if (user == null) {
            user = userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        
        if (unverifiedUsers.containsKey(normalizedEmail)) {
            userRepository.save(user);
            unverifiedUsers.remove(normalizedEmail);
            return user;
        } else {
            return userRepository.save(user);
        }
    }

    private String normalize(String email) {
        return email.toLowerCase().trim();
    }
}
