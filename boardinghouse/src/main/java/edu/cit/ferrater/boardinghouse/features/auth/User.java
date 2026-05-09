package edu.cit.ferrater.boardinghouse.features.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;  // stored as BCrypt hash

    @Column(nullable = false)
    private String firstName;  // new required field

    @Column(nullable = false)
    private String lastName;   // new required field

    private String role;  // e.g. ROLE_USER, ROLE_ADMIN

    @Column(columnDefinition = "TEXT")
    private String profilePicture; // URL or Base64
}
