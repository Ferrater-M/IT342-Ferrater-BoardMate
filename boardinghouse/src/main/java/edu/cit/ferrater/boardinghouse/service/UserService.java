package edu.cit.ferrater.boardinghouse.service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.ferrater.boardinghouse.entity.User;
import edu.cit.ferrater.boardinghouse.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Authenticate user
    public String authenticate(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new Exception("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Incorrect password");
        }

        return generateJwtToken(user);
    }

    // Generate JWT token
    private String generateJwtToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Register user
    public User registerUser(String email, String password, String role, String firstName, String lastName) {
        String normalizedEmail = email.toLowerCase().trim();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        String encodedPassword = passwordEncoder.encode(password);

        User user = User.builder()
                .email(normalizedEmail)
                .password(encodedPassword)
                .role(role)
                .firstName(firstName)
                .lastName(lastName)
                .build();

        return userRepository.save(user);
    }
}