package edu.cit.ferrater.boardinghouse.features.rooms;

import com.fasterxml.jackson.annotation.JsonBackReference;
import edu.cit.ferrater.boardinghouse.features.auth.User;
import edu.cit.ferrater.boardinghouse.features.houses.HouseDetails;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNumber;
    private String type; // e.g., Single, Double
    private String price;
    private String inclusions; // e.g., Water • Wi-Fi
    private String status; // e.g., Available, Occupied, Your Room
    private String paymentStatus; // e.g., Paid, Not Paid
    private String billingMonth; // e.g., April 2026

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id")
    @JsonBackReference
    private HouseDetails house;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "occupant_id")
    private User occupant;

    private String occupantName; // For manual entry or quick display
}
