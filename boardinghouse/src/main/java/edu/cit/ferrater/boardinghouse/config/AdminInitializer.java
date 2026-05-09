package edu.cit.ferrater.boardinghouse.config;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.auth.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin1@gmail.com";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = User.builder()
                        .firstName("admin")
                        .lastName("1")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Admin_1"))
                        .role("ROLE_SUPERADMIN")
                        .build();
                userRepository.save(admin);
                System.out.println("Super Admin account created: " + adminEmail);
            }
        };
    }
}
