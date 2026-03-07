package edu.cit.ferrater.boardinghouse.service;

import edu.cit.ferrater.boardinghouse.entity.User;
import edu.cit.ferrater.boardinghouse.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final String jwtSecret = "your_jwt_secret_key";  // use environment variable in prod
    private final long jwtExpirationMs = 86400000; // 1 day

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public String authenticate(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid password");
        }

        return generateJwtToken(user);
    }

    private String generateJwtToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    // For creating a user with hashed password (registration)
    public User registerUser(String email, String password, String role) {
        String encodedPassword = passwordEncoder.encode(password);
        User user = User.builder()
                .email(email)
                .password(encodedPassword)
                .role(role)
                .build();
        return userRepository.save(user);
    }
}