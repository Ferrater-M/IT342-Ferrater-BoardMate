package edu.cit.ferrater.boardinghouse.features.visits;

import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.houses.HouseDetails;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_requests")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisitRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "house_id")
    private HouseDetails house;

    private LocalDateTime requestedDateTime;
    
    private String message;
    
    private String status; // PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED

    private LocalDateTime createdAt;
}
